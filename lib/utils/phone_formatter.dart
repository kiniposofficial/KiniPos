class PhoneFormatter {
  /// Normalizes an Indonesian phone number to E.164 format (+62...)
  /// Handles various inputs like '0812', '812', '62812', '+62812', '062812'
  static String normalizeIndonesian(String phone) {
    // 1. Remove all non-digits
    String cleaned = phone.replaceAll(RegExp(r'\D'), '');
    if (cleaned.isEmpty) return '';

    // 2. Process to get the base number (without leading 0 or 62)
    String base = cleaned;

    // Handle '62' prefix
    if (base.startsWith('62')) {
      base = base.substring(2);
    }

    // Handle '0' prefix (often after '08...' or '6208...')
    if (base.startsWith('0')) {
      base = base.substring(1);
    }

    // 3. Re-prepend Indonesian country code
    return '+62$base';
  }

  /// Formats phone number for display (e.g., +62 812-3456-7890)
  static String formatForDisplay(String phone) {
    String normalized = normalizeIndonesian(phone);
    if (normalized.length < 5) return normalized;

    // Simple grouping for display: +62 8XX-XXXX-XXXX
    String country = normalized.substring(0, 3);
    String body = normalized.substring(3);

    if (body.length <= 3) return '$country $body';
    if (body.length <= 7)
      return '$country ${body.substring(0, 3)}-${body.substring(3)}';

    return '$country ${body.substring(0, 3)}-${body.substring(3, 7)}-${body.substring(7)}';
  }
}
