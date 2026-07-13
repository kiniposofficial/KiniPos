/// User model for KiniPos
/// Represents a business owner/user of the app
class UserModel {
  final String id; // Firebase UID
  final String phone;
  final String ownerName;
  final String businessName;
  final String businessType; // 'retail' or 'laundry'
  final DateTime createdAt;
  final DateTime? subscriptionUntil;

  UserModel({
    required this.id,
    required this.phone,
    required this.ownerName,
    required this.businessName,
    required this.businessType,
    required this.createdAt,
    this.subscriptionUntil,
  });

  /// Create UserModel from Firestore document
  factory UserModel.fromFirestore(Map<String, dynamic> data, String id) {
    return UserModel(
      id: id,
      phone: data['phone'] ?? '',
      ownerName: data['ownerName'] ?? '',
      businessName: data['businessName'] ?? '',
      businessType: data['businessType'] ?? 'retail',
      createdAt: data['createdAt']?.toDate() ?? DateTime.now(),
      subscriptionUntil: data['subscriptionUntil']?.toDate(),
    );
  }

  /// Convert UserModel to Firestore document
  Map<String, dynamic> toFirestore() {
    return {
      'phone': phone,
      'ownerName': ownerName,
      'businessName': businessName,
      'businessType': businessType,
      'createdAt': createdAt,
      'subscriptionUntil': subscriptionUntil,
    };
  }

  /// Create a copy with updated fields
  UserModel copyWith({
    String? id,
    String? phone,
    String? ownerName,
    String? businessName,
    String? businessType,
    DateTime? createdAt,
  }) {
    return UserModel(
      id: id ?? this.id,
      phone: phone ?? this.phone,
      ownerName: ownerName ?? this.ownerName,
      businessName: businessName ?? this.businessName,
      businessType: businessType ?? this.businessType,
      createdAt: createdAt ?? this.createdAt,
      subscriptionUntil: subscriptionUntil ?? this.subscriptionUntil,
    );
  }

  /// Check if profile has basic info
  bool get isProfileComplete => ownerName.isNotEmpty && businessName.isNotEmpty;

  /// Helper methods for access control
  bool get isTrialActive => DateTime.now().difference(createdAt).inDays < 7;

  bool get isSubscriptionActive =>
      subscriptionUntil != null && subscriptionUntil!.isAfter(DateTime.now());

  bool get canAccess => isTrialActive || isSubscriptionActive;

  int get remainingTrialDays {
    final diff = 7 - DateTime.now().difference(createdAt).inDays;
    return diff > 0 ? diff : 0;
  }
}
