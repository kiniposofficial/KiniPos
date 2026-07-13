import 'package:cloud_firestore/cloud_firestore.dart';

class TransactionItem {
  final String productId;
  final String productName;
  final double price;
  final double quantity;
  final String unit;

  TransactionItem({
    required this.productId,
    required this.productName,
    required this.price,
    required this.quantity,
    required this.unit,
  });

  Map<String, dynamic> toMap() {
    return {
      'productId': productId,
      'productName': productName,
      'price': price,
      'quantity': quantity,
      'unit': unit,
    };
  }

  factory TransactionItem.fromMap(Map<String, dynamic> map) {
    return TransactionItem(
      productId: map['productId'] ?? '',
      productName: map['productName'] ?? '',
      price: (map['price'] ?? 0.0).toDouble(),
      quantity: (map['quantity'] ?? 0.0).toDouble(),
      unit: map['unit'] ?? 'pcs',
    );
  }
}

class TransactionModel {
  final String id;
  final String userId;
  final String customerName;
  final String phoneNumber;
  final List<TransactionItem> items;
  final double totalPrice;
  final bool isPaid;
  final String paymentMethod; // e.g., "Tunai", "Transfer", "QRIS"
  final DateTime createdAt;
  final String? laundryStatus; // "masuk", "selesai"

  TransactionModel({
    required this.id,
    required this.userId,
    required this.customerName,
    required this.phoneNumber,
    required this.items,
    required this.totalPrice,
    required this.isPaid,
    required this.paymentMethod,
    required this.createdAt,
    this.laundryStatus,
  });

  Map<String, dynamic> toMap() {
    return {
      'userId': userId,
      'customerName': customerName,
      'phoneNumber': phoneNumber,
      'items': items.map((x) => x.toMap()).toList(),
      'totalPrice': totalPrice,
      'isPaid': isPaid,
      'paymentMethod': paymentMethod,
      'createdAt': Timestamp.fromDate(createdAt),
      'laundryStatus': laundryStatus ?? 'masuk',
    };
  }

  factory TransactionModel.fromMap(String id, Map<String, dynamic> map) {
    final list = map['items'] as List? ?? [];
    final parsedItems = list
        .map((x) => TransactionItem.fromMap(Map<String, dynamic>.from(x)))
        .toList();

    return TransactionModel(
      id: id,
      userId: map['userId'] ?? '',
      customerName: map['customerName'] ?? 'Pelanggan Umum',
      phoneNumber: map['phoneNumber'] ?? '',
      items: parsedItems,
      totalPrice: (map['totalPrice'] ?? 0.0).toDouble(),
      isPaid: map['isPaid'] ?? false,
      paymentMethod: map['paymentMethod'] ?? 'Tunai',
      createdAt: (map['createdAt'] as Timestamp).toDate(),
      laundryStatus: map['laundryStatus'] ?? 'masuk',
    );
  }
}
