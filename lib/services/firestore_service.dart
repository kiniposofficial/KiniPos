import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../models/product.dart';
import '../models/transaction.dart';
import '../models/payment.dart';

class FirestoreService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseAuth _auth = FirebaseAuth.instance;

  String? get _userId => _auth.currentUser?.uid;

  // =====================
  // PAYMENTS
  // =====================

  /// Get all payments for current user
  Stream<List<Payment>> getPayments() {
    if (_userId == null) return Stream.value([]);

    return _firestore
        .collection('payments')
        .where('userId', isEqualTo: _userId)
        .snapshots()
        .map((snapshot) {
          final list = snapshot.docs
              .map((doc) => Payment.fromFirestore(doc.data(), doc.id))
              .toList();
          list.sort((a, b) => b.createdAt.compareTo(a.createdAt));
          return list;
        });
  }

  /// Add a new payment
  Future<String> addPayment(Payment payment) async {
    if (_userId == null) throw Exception('User not logged in');

    final docRef = await _firestore
        .collection('payments')
        .add(payment.copyWith(userId: _userId).toFirestore());
    return docRef.id;
  }

  /// Delete a payment
  Future<void> deletePayment(String paymentId) async {
    await _firestore.collection('payments').doc(paymentId).delete();
  }

  // =====================
  // PRODUCTS
  // =====================

  /// Get all products for current user
  Stream<List<Product>> getProducts() {
    if (_userId == null) return Stream.value([]);

    return _firestore
        .collection('products')
        .where('userId', isEqualTo: _userId)
        .snapshots()
        .map((snapshot) {
      final list = snapshot.docs
          .map((doc) => Product.fromFirestore(doc.data(), doc.id))
          .toList();
      list.sort((a, b) => a.name.compareTo(b.name));
      return list;
    });
  }

  /// Add a new product
  Future<String> addProduct(Product product) async {
    if (_userId == null) throw Exception('User not logged in');

    final docRef = await _firestore
        .collection('products')
        .add(product.copyWith(userId: _userId).toFirestore());
    return docRef.id;
  }

  /// Update a product
  Future<void> updateProduct(Product product) async {
    await _firestore
        .collection('products')
        .doc(product.id)
        .update(product.toFirestore());
  }

  /// Delete a product
  Future<void> deleteProduct(String productId) async {
    await _firestore.collection('products').doc(productId).delete();
  }

  // =====================
  // TRANSACTIONS
  // =====================

  /// Get all transactions for current user
  Stream<List<TransactionModel>> getTransactions() {
    if (_userId == null) return Stream.value([]);

    return _firestore
        .collection('transactions')
        .where('userId', isEqualTo: _userId)
        .snapshots()
        .map((snapshot) {
      final list = snapshot.docs
          .map((doc) => TransactionModel.fromMap(doc.id, doc.data()))
          .toList();
      list.sort((a, b) => b.createdAt.compareTo(a.createdAt));
      return list;
    });
  }

  /// Add a new transaction
  Future<String> addTransaction(TransactionModel transaction) async {
    if (_userId == null) throw Exception('User not logged in');

    final data = transaction.toMap();
    data['userId'] = _userId;

    final docRef = await _firestore.collection('transactions').add(data);

    // Auto deduct product stock
    for (var item in transaction.items) {
      try {
        final productDoc = await _firestore.collection('products').doc(item.productId).get();
        if (productDoc.exists) {
          final currentStock = (productDoc.data()?['stock'] ?? 0.0).toDouble();
          final newStock = currentStock - item.quantity;
          await _firestore.collection('products').doc(item.productId).update({'stock': newStock});
        }
      } catch (e) {
        print('Error updating stock: $e');
      }
    }

    return docRef.id;
  }

  /// Update transaction payment status
  Future<void> updateTransactionPaymentStatus(String transactionId, bool isPaid) async {
    await _firestore
        .collection('transactions')
        .doc(transactionId)
        .update({'isPaid': isPaid});
  }

  /// Update transaction laundry status
  Future<void> updateTransactionLaundryStatus(String transactionId, String status) async {
    await _firestore
        .collection('transactions')
        .doc(transactionId)
        .update({'laundryStatus': status});
  }

  /// Delete transaction
  Future<void> deleteTransaction(String transactionId) async {
    await _firestore.collection('transactions').doc(transactionId).delete();
  }

  /// Update transaction details
  Future<void> updateTransaction(TransactionModel transaction) async {
    final data = transaction.toMap();
    if (_userId != null) {
      data['userId'] = _userId;
    }
    await _firestore
        .collection('transactions')
        .doc(transaction.id)
        .update(data);
  }
}
