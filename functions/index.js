const functions = require("firebase-functions");
const admin = require("firebase-admin");
const midtransClient = require("midtrans-client");
const crypto = require("crypto");

admin.initializeApp();

// Initialize Midtrans client
const midtransConfig = {
  server_key: process.env.MIDTRANS_SERVER_KEY || "YOUR_MIDTRANS_SERVER_KEY",
  client_key: process.env.MIDTRANS_CLIENT_KEY || "YOUR_MIDTRANS_CLIENT_KEY"
};

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: midtransConfig.server_key,
  clientKey: midtransConfig.client_key
});

/**
 * Function to get Midtrans Snap Token
 */
exports.getSnapToken = functions.https.onCall(async (data, context) => {
  // Check auth
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be logged in.");
  }

  const userId = context.auth.uid;
  const amount = data.amount || 20000;
  const orderId = `SUB-${userId}-${Date.now()}`;

  const parameter = {
    "transaction_details": {
      "order_id": orderId,
      "gross_amount": amount
    },
    "credit_card": {
      "secure": true
    },
    "customer_details": {
      "first_name": data.ownerName || "User",
      "email": data.email || ""
    },
    // We pass userId to metadata so we can identify the user in webhook
    "metadata": {
      "user_id": userId
    }
  };

  try {
    const transaction = await snap.createTransaction(parameter);
    return {
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      order_id: orderId
    };
  } catch (error) {
    console.error("Midtrans Error:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

/**
 * Webhook to receive payment status updates from Midtrans
 */
exports.midtransWebhook = functions.https.onRequest(async (req, res) => {
  const notification = req.body;

  // 1. Verify Signature (Mandatory for security)
  const serverKey = midtransConfig.server_key;
  const signatureKey = crypto.createHash('sha512')
    .update(notification.order_id + notification.status_code + notification.gross_amount + serverKey)
    .digest('hex');

  if (signatureKey !== notification.signature_key) {
    console.error("Invalid Signature");
    return res.status(401).send("Invalid Signature");
  }

  const transactionStatus = notification.transaction_status;
  const fraudStatus = notification.fraud_status;
  const orderId = notification.order_id;

  // Extract userId from orderId (SUB-userId-timestamp)
  const parts = orderId.split("-");
  const userId = parts[1];

  console.log(`Transaction notification received. Order ID: ${orderId}. Status: ${transactionStatus}. User: ${userId}`);

  if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
    if (fraudStatus === 'challenge') {
      // Action needed
    } else if (fraudStatus === 'accept' || transactionStatus === 'settlement') {
      // SUCCESS! Update subscription

      const userRef = admin.firestore().collection('users').doc(userId);
      const userDoc = await userRef.get();

      if (userDoc.exists) {
        let currentUntil = userDoc.data().subscriptionUntil;
        let newUntil;

        const now = new Date();
        const baseDate = (currentUntil && currentUntil.toDate() > now)
          ? currentUntil.toDate()
          : now;

        newUntil = new Date(baseDate);
        newUntil.setDate(newUntil.getDate() + 30); // Add 30 days

        await userRef.update({
          subscriptionUntil: admin.firestore.Timestamp.fromDate(newUntil)
        });

        console.log(`Updated subscription for user ${userId} until ${newUntil}`);
      }
    }
  } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
    // Payment failure
    console.log(`Payment failed for order ${orderId}`);
  }

  res.status(200).send("OK");
});
