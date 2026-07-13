import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lottie/lottie.dart';
import '../providers/auth_provider.dart';
import '../utils/phone_formatter.dart';
import '../widgets/organic_background.dart';

import 'otp_screen.dart';

class RegistrationScreen extends ConsumerStatefulWidget {
  const RegistrationScreen({super.key});

  @override
  ConsumerState<RegistrationScreen> createState() => _RegistrationScreenState();
}

class _RegistrationScreenState extends ConsumerState<RegistrationScreen> {
  final _phoneController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  bool _isLoading = false;

  @override
  void dispose() {
    _phoneController.dispose();
    super.dispose();
  }

  void _sendOTP() async {
    if (!_formKey.currentState!.validate()) return;

    FocusScope.of(context).unfocus();

    final authNotifier = ref.read(authNotifierProvider.notifier);
    final rawPhoneNumber = _phoneController.text.trim();
    final formattedNumber = PhoneFormatter.normalizeIndonesian(rawPhoneNumber);

    setState(() => _isLoading = true);

    try {
      final exists = await authNotifier.checkPhoneExists(formattedNumber);

      if (exists) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Nomor ini sudah terdaftar. Silakan login.'),
              backgroundColor: Colors.orange,
            ),
          );
          Navigator.pop(context); // Go back to Login
        }
        return;
      }

      await authNotifier.sendOTP(formattedNumber);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Terjadi kesalahan: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }

    final state = ref.read(authNotifierProvider);
    if (state.verificationId != null && mounted) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) =>
              OTPScreen(phoneNumber: formattedNumber, isRegistration: true),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authNotifierProvider);
    final isGlobalLoading = authState.isLoading;

    return Scaffold(
      backgroundColor: Colors.white,
      resizeToAvoidBottomInset: false,
      body: Stack(
        children: [
          const OrganicBackground(),

          SafeArea(
            child: Column(
              children: [
                // Custom App Bar Area
                Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  child: Row(
                    children: [
                      Container(
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.8),
                          shape: BoxShape.circle,
                        ),
                        child: IconButton(
                          icon: const Icon(
                            Icons.arrow_back_ios_new_rounded,
                            color: Colors.black,
                            size: 20,
                          ),
                          onPressed: () => Navigator.pop(context),
                        ),
                      ),
                    ],
                  ),
                ),

                Expanded(
                  child: Center(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Card(
                            elevation: 12,
                            shadowColor: Colors.black.withOpacity(0.15),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(32),
                            ),
                            color: Colors.white,
                            surfaceTintColor: Colors.white,
                            child: Padding(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 24,
                                vertical: 40,
                              ),
                              child: Form(
                                key: _formKey,
                                child: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  crossAxisAlignment:
                                      CrossAxisAlignment.stretch,
                                  children: [
                                    // Illustration
                                    Center(
                                      child: Image.asset(
                                        'assets/kinipos_logo.png',
                                        height: 100,
                                        fit: BoxFit.contain,
                                        errorBuilder:
                                            (context, error, stackTrace) {
                                              return const Icon(
                                                Icons.person_add_rounded,
                                                size: 80,
                                                color: Color(0xFF0B192C),
                                              );
                                            },
                                      ),
                                    ),
                                    const SizedBox(height: 24),

                                    Text(
                                      'Buat Akun Baru',
                                      textAlign: TextAlign.center,
                                      style: GoogleFonts.outfit(
                                        fontSize: 24,
                                        fontWeight: FontWeight.w500,
                                        letterSpacing: 1.0,
                                        color: const Color(0xFF2D2D2D),
                                      ),
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      'Gabung sekarang untuk mulai mencatat',
                                      textAlign: TextAlign.center,
                                      style: GoogleFonts.outfit(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w300,
                                        letterSpacing: 0.5,
                                        color: Colors.grey[600],
                                      ),
                                    ),
                                    const SizedBox(height: 32),

                                    // Phone Input
                                    TextFormField(
                                      controller: _phoneController,
                                      keyboardType: TextInputType.phone,
                                      inputFormatters: [
                                        FilteringTextInputFormatter.digitsOnly,
                                      ],
                                      style: GoogleFonts.outfit(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w600,
                                        color: const Color(0xFF2D3436),
                                      ),
                                      decoration: InputDecoration(
                                        labelText: 'Nomor WhatsApp',
                                        labelStyle: GoogleFonts.outfit(
                                          fontSize: 14,
                                          color: Colors.grey[500],
                                        ),
                                        hintText: '08xx-xxxx-xxxx',
                                        hintStyle: GoogleFonts.outfit(
                                          color: Colors.grey[300],
                                        ),
                                        prefixIcon: const Icon(
                                          Icons.phone_android_rounded,
                                          color: Color(0xFFC5A059),
                                        ),
                                        border: OutlineInputBorder(
                                          borderRadius: BorderRadius.circular(
                                            20,
                                          ),
                                          borderSide: BorderSide.none,
                                        ),
                                        filled: true,
                                        fillColor: const Color(0xFFF5F6FA),
                                        contentPadding:
                                            const EdgeInsets.symmetric(
                                              vertical: 20,
                                              horizontal: 20,
                                            ),
                                        enabledBorder: OutlineInputBorder(
                                          borderRadius: BorderRadius.circular(
                                            20,
                                          ),
                                          borderSide: BorderSide.none,
                                        ),
                                        focusedBorder: OutlineInputBorder(
                                          borderRadius: BorderRadius.circular(
                                            20,
                                          ),
                                          borderSide: const BorderSide(
                                            color: Color(0xFF0B192C),
                                            width: 2,
                                          ),
                                        ),
                                      ),
                                      validator: (value) {
                                        if (value == null || value.isEmpty)
                                          return 'Wajib diisi';
                                        if (value.length < 10)
                                          return 'Nomor terlalu pendek';
                                        return null;
                                      },
                                    ),
                                    const SizedBox(height: 32),

                                    // Register Button
                                    SizedBox(
                                      height: 56,
                                      child: ElevatedButton(
                                        onPressed:
                                            (isGlobalLoading || _isLoading)
                                            ? null
                                            : _sendOTP,
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: const Color(0xFF0B192C),
                                          foregroundColor: Colors.white,
                                          elevation: 8,
                                          shadowColor: const Color(0xFF0B192C).withOpacity(
                                            0.5,
                                          ),
                                          shape: RoundedRectangleBorder(
                                            borderRadius: BorderRadius.circular(
                                              20,
                                            ),
                                          ),
                                        ),
                                        child: (isGlobalLoading || _isLoading)
                                            ? const SizedBox(
                                                width: 24,
                                                height: 24,
                                                child:
                                                    CircularProgressIndicator(
                                                      color: Colors.white,
                                                      strokeWidth: 2,
                                                    ),
                                              )
                                            : Text(
                                                'Kirim Kode OTP',
                                                style: GoogleFonts.outfit(
                                                  fontSize: 16,
                                                  fontWeight: FontWeight.w600,
                                                  letterSpacing: 1,
                                                ),
                                              ),
                                      ),
                                    ),

                                    const SizedBox(height: 24),

                                    // Divider
                                    Row(
                                      children: [
                                        const Expanded(child: Divider()),
                                        Padding(
                                          padding: const EdgeInsets.symmetric(
                                            horizontal: 16,
                                          ),
                                          child: Text(
                                            'Atau daftar dengan',
                                            style: GoogleFonts.outfit(
                                              fontSize: 12,
                                              color: Colors.grey[400],
                                            ),
                                          ),
                                        ),
                                        const Expanded(child: Divider()),
                                      ],
                                    ),

                                    const SizedBox(height: 24),

                                    // Google Login Button
                                    OutlinedButton.icon(
                                      onPressed: isGlobalLoading
                                          ? null
                                          : () async {
                                              final success = await ref
                                                  .read(authNotifierProvider.notifier)
                                                  .signInWithGoogle();
                                              
                                              if (success && mounted) {
                                                // Create initial profile for new Google users
                                                await ref.read(authServiceProvider).createInitialProfile();
                                                if (mounted) {
                                                  Navigator.of(context).popUntil((route) => route.isFirst);
                                                }
                                              }
                                            },
                                      icon: Image.asset(
                                        'assets/google_logo.png',
                                        height: 24,
                                        width: 24,
                                        errorBuilder:
                                            (context, e, s) => const Icon(
                                              Icons.g_mobiledata,
                                              size: 24,
                                            ),
                                      ),
                                      label: Text(
                                        'Sign up with Google',
                                        style: GoogleFonts.outfit(
                                          fontSize: 14,
                                          fontWeight: FontWeight.w600,
                                          color: const Color(0xFF2D3436),
                                        ),
                                      ),
                                      style: OutlinedButton.styleFrom(
                                        padding: const EdgeInsets.symmetric(
                                          vertical: 14,
                                        ),
                                        shape: RoundedRectangleBorder(
                                          borderRadius: BorderRadius.circular(
                                            20,
                                          ),
                                        ),
                                        side: BorderSide(
                                          color: Colors.grey[200]!,
                                        ),
                                      ),
                                    ),

                                    const SizedBox(height: 24),

                                    // Back to Login Link
                                    Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      children: [
                                        Text(
                                          'Sudah punya akun? ',
                                          style: GoogleFonts.outfit(
                                            color: Colors.grey[500],
                                            fontSize: 13,
                                          ),
                                        ),
                                        GestureDetector(
                                          onTap: () => Navigator.pop(context),
                                          child: Text(
                                            'Masuk',
                                            style: GoogleFonts.outfit(
                                              color: const Color(0xFFC5A059),
                                              fontWeight: FontWeight.w600,
                                              fontSize: 13,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
