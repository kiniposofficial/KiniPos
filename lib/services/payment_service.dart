import 'package:cloud_functions/cloud_functions.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/user_model.dart';

class PaymentService {
  /// Create invoice and return snap token & redirect url using Firebase Callable Function
  static Future<Map<String, dynamic>> createKiniPosInvoice(
    UserModel user, {
    int amount = 20000,
  }) async {
    try {
      final HttpsCallable callable = FirebaseFunctions.instanceFor(
        region: 'asia-southeast2', // Adjust to your function region
      ).httpsCallable('getSnapToken');

      final response = await callable.call(<String, dynamic>{
        'amount': amount,
        'ownerName': user.ownerName,
        'email': user.id, // Or use actual email if available
      });

      return Map<String, dynamic>.from(response.data);
    } catch (e) {
      throw Exception('Gagal membuat invoice: $e');
    }
  }

  /// Launch WhatsApp for manual payment
  static Future<void> launchWhatsAppPayment({
    required String adminPhone,
    required String ownerName,
    required String userId,
    required String planName,
    required String amount,
  }) async {
    final message = "Halo Admin Kini Pos,\n\n"
        "Saya ingin aktivasi akun Premium:\n"
        "- Nama: $ownerName\n"
        "- User ID: $userId\n"
        "- Paket: $planName\n"
        "- Nominal: $amount\n\n"
        "Mohon info nomor rekening untuk pembayarannya. Terima kasih.";

    final whatsappUrl = Uri.parse(
      "https://wa.me/$adminPhone?text=${Uri.encodeComponent(message)}",
    );

    if (await canLaunchUrl(whatsappUrl)) {
      await launchUrl(whatsappUrl, mode: LaunchMode.externalApplication);
    } else {
      throw Exception('Tidak bisa membuka WhatsApp');
    }
  }
}
