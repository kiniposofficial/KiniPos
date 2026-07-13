class Product {
  final String id;
  final String userId;
  final String name;
  final double price;
  final String unit; // pcs, kg, pack, box, dll
  final double stock;
  final DateTime createdAt;

  Product({
    required this.id,
    required this.userId,
    required this.name,
    required this.price,
    required this.unit,
    required this.stock,
    required this.createdAt,
  });

  Map<String, dynamic> toFirestore() {
    return {
      'userId': userId,
      'name': name,
      'price': price,
      'unit': unit,
      'stock': stock,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  factory Product.fromFirestore(Map<String, dynamic> data, String id) {
    return Product(
      id: id,
      userId: data['userId'] ?? '',
      name: data['name'] ?? '',
      price: (data['price'] ?? 0.0).toDouble(),
      unit: data['unit'] ?? 'pcs',
      stock: (data['stock'] ?? 0.0).toDouble(),
      createdAt: DateTime.parse(data['createdAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Product copyWith({
    String? id,
    String? userId,
    String? name,
    double? price,
    String? unit,
    double? stock,
    DateTime? createdAt,
  }) {
    return Product(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      name: name ?? this.name,
      price: price ?? this.price,
      unit: unit ?? this.unit,
      stock: stock ?? this.stock,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}
