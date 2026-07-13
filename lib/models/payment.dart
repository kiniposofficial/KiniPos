/// Payment model for KiniPos
/// Represents a debt payment from a customer
class Payment {
  final String id; // Firestore doc ID
  final String userId; // Owner of this payment record
  final String customerId;
  final String customerName; // Denormalized for easy display
  final double amount;
  final String? note;
  final DateTime createdAt;

  Payment({
    required this.id,
    required this.userId,
    required this.customerId,
    required this.customerName,
    required this.amount,
    this.note,
    required this.createdAt,
  });

  /// Create Payment from Firestore document
  factory Payment.fromFirestore(Map<String, dynamic> data, String id) {
    return Payment(
      id: id,
      userId: data['userId'] ?? '',
      customerId: data['customerId'] ?? '',
      customerName: data['customerName'] ?? '',
      amount: (data['amount'] ?? 0).toDouble(),
      note: data['note'],
      createdAt: data['createdAt']?.toDate() ?? DateTime.now(),
    );
  }

  /// Convert Payment to Firestore document
  Map<String, dynamic> toFirestore() {
    return {
      'userId': userId,
      'customerId': customerId,
      'customerName': customerName,
      'amount': amount,
      'note': note,
      'createdAt': createdAt,
    };
  }

  /// Create a copy with updated fields
  Payment copyWith({
    String? id,
    String? userId,
    String? customerId,
    String? customerName,
    double? amount,
    String? note,
    DateTime? createdAt,
  }) {
    return Payment(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      customerId: customerId ?? this.customerId,
      customerName: customerName ?? this.customerName,
      amount: amount ?? this.amount,
      note: note ?? this.note,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}
