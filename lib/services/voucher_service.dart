import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

class VoucherService {
  static final FirebaseFirestore _db = FirebaseFirestore.instance;

  /// Redeem a voucher code and update user's subscription
  static Future<void> redeemVoucher(String code) async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) throw Exception('User tidak ditemukan');

    // 1. Search for the voucher code (query by code only, cek isUsed di Dart)
    final voucherQuery = await _db
        .collection('vouchers')
        .where('code', isEqualTo: code.toUpperCase().trim())
        .limit(1)
        .get();

    if (voucherQuery.docs.isEmpty) {
      throw Exception('Kode aktivasi tidak ditemukan');
    }

    final voucherDoc = voucherQuery.docs.first;
    final int durationDays = (voucherDoc.data()['durationDays'] as int?) ?? 30;

    // 2. Update user subscription logic
    final userRef = _db.collection('users').doc(user.uid);
    final voucherRef = voucherDoc.reference;
    
    await _db.runTransaction((transaction) async {
      final userSnapshot = await transaction.get(userRef);
      if (!userSnapshot.exists) throw Exception('Data user tidak ditemukan');

      final voucherSnapshot = await transaction.get(voucherRef);
      if (!voucherSnapshot.exists) throw Exception('Kode aktivasi tidak ditemukan');

      final voucherData = voucherSnapshot.data() as Map<String, dynamic>;
      final isUsed = voucherData['isUsed'];
      if (isUsed == true || isUsed == 'true') {
        throw Exception('Kode aktivasi sudah digunakan');
      }

      final userData = userSnapshot.data() as Map<String, dynamic>;
      final Timestamp? currentUntil = userData['subscriptionUntil'] as Timestamp?;
      
      DateTime baseDate = DateTime.now();
      // If user already has active subscription, add to it
      if (currentUntil != null && currentUntil.toDate().isAfter(baseDate)) {
        baseDate = currentUntil.toDate();
      }

      final DateTime newUntil = baseDate.add(Duration(days: durationDays));

      // Update User
      transaction.update(userRef, {
        'subscriptionUntil': Timestamp.fromDate(newUntil),
      });

      // Mark voucher as used atomically
      transaction.update(voucherRef, {
        'isUsed': true,
        'usedBy': user.uid,
        'usedAt': FieldValue.serverTimestamp(),
      });
    });
  }
}
