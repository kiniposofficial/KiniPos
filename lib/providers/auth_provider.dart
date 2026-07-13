import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../services/auth_service.dart';
import '../models/user_model.dart';
import '../utils/phone_formatter.dart';

/// Provider for AuthService instance
final authServiceProvider = Provider<AuthService>((ref) => AuthService());

/// Provider for current Firebase user
final authStateProvider = StreamProvider<User?>((ref) {
  return ref.watch(authServiceProvider).authStateChanges;
});

/// Provider for user profile from Firestore (Real-time)
final userProfileProvider = StreamProvider<UserModel?>((ref) {
  final authState = ref.watch(authStateProvider);

  return authState.when(
    data: (user) {
      if (user == null) return Stream.value(null);
      return ref.watch(authServiceProvider).watchUserProfile();
    },
    loading: () => Stream.value(null),
    error: (_, __) => Stream.value(null),
  );
});

/// Provider to check if profile is complete
final isProfileCompleteProvider = FutureProvider<bool>((ref) async {
  final authState = ref.watch(authStateProvider);

  return authState.when(
    data: (user) async {
      if (user == null) return false;
      return await ref.read(authServiceProvider).isProfileComplete();
    },
    loading: () => false,
    error: (_, __) => false,
  );
});

/// Auth state notifier for managing login flow
class AuthNotifier extends StateNotifier<AuthState> {
  final AuthService _authService;

  AuthNotifier(this._authService) : super(AuthState.initial());

  /// Send OTP to phone number
  Future<void> sendOTP(String phoneNumber) async {
    state = state.copyWith(isLoading: true, error: null);

    // Format phone number for Indonesia
    String formattedNumber = PhoneFormatter.normalizeIndonesian(phoneNumber);

    await _authService.sendOTP(
      phoneNumber: formattedNumber,
      onCodeSent: (verificationId) {
        state = state.copyWith(
          isLoading: false,
          verificationId: verificationId,
          phoneNumber: formattedNumber,
        );
      },
      onError: (error) {
        state = state.copyWith(
          isLoading: false,
          error: _getIndonesianError(error),
        );
      },
      onAutoVerify: (credential) async {
        state = state.copyWith(isLoading: true);
        try {
          await _authService.signInWithCredential(credential);
          state = state.copyWith(isLoading: false, isLoggedIn: true);
        } catch (e) {
          state = state.copyWith(
            isLoading: false,
            error: _getIndonesianError(e.toString()),
          );
        }
      },
    );
  }

  /// Verify OTP
  Future<bool> verifyOTP(String otp) async {
    if (state.verificationId == null) {
      state = state.copyWith(error: 'Sesi verifikasi kadaluarsa');
      return false;
    }

    state = state.copyWith(isLoading: true, error: null);

    try {
      await _authService.verifyOTP(
        verificationId: state.verificationId!,
        otp: otp,
      );
      state = state.copyWith(isLoading: false, isLoggedIn: true);
      return true;
    } on FirebaseAuthException catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: _getIndonesianError(e.code),
      );
      return false;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: _getIndonesianError(e.toString()),
      );
      return false;
    }
  }

  /// Start phone linking process
  Future<bool> startPhoneLinking(String phoneNumber) async {
    state = state.copyWith(isLoading: true, error: null);

    // Format phone number
    String formattedNumber = PhoneFormatter.normalizeIndonesian(phoneNumber);

    try {
      await _authService.verifyPhoneForLinking(
        phoneNumber: formattedNumber,
        verificationCompleted: (credential) async {
          // Auto-linking if appropriate
        },
        verificationFailed: (e) {
          state = state.copyWith(
            isLoading: false,
            error: _getIndonesianError(e.code),
          );
        },
        codeSent: (verificationId, resendToken) {
          state = state.copyWith(
            isLoading: false,
            verificationId: verificationId,
            phoneNumber: phoneNumber,
          );
        },
        codeAutoRetrievalTimeout: (verificationId) {},
      );

      return true;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: _getIndonesianError(e.toString()),
      );
      return false;
    }
  }

  /// Verify OTP for linking
  Future<bool> verifyLinkingOTP(String otp) async {
    if (state.verificationId == null) return false;

    state = state.copyWith(isLoading: true, error: null);

    try {
      final credential = PhoneAuthProvider.credential(
        verificationId: state.verificationId!,
        smsCode: otp,
      );

      await _authService.linkWithCredential(credential);

      state = state.copyWith(isLoading: false, verificationId: null);
      return true;
    } on FirebaseAuthException catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: _getIndonesianError(e.code),
      );
      return false;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: _getIndonesianError(e.toString()),
      );
      return false;
    }
  }

  /// Sign in with Google
  Future<bool> signInWithGoogle() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final credential = await _authService.signInWithGoogle();
      if (credential != null) {
        state = state.copyWith(isLoading: false, isLoggedIn: true);
        return true;
      } else {
        // User cancelled
        state = state.copyWith(isLoading: false);
        return false;
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: _getIndonesianError(e.toString()),
      );
      return false;
    }
  }

  /// Check if phone exists
  Future<bool> checkPhoneExists(String phone) async {
    return await _authService.checkPhoneExists(phone);
  }

  /// Save user profile
  Future<bool> saveProfile({
    required String ownerName,
    required String businessName,
    String? phone,
  }) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      await _authService.saveUserProfile(
        ownerName: ownerName,
        businessName: businessName,
        businessType: 'laundry',
        phone: phone,
      );
      state = state.copyWith(isLoading: false);
      return true;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: _getIndonesianError(e.toString()),
      );
      return false;
    }
  }

  /// Verify OTP for phone update
  Future<bool> verifyUpdatePhoneOTP(String otp) async {
    if (state.verificationId == null) return false;

    state = state.copyWith(isLoading: true, error: null);

    try {
      final credential = PhoneAuthProvider.credential(
        verificationId: state.verificationId!,
        smsCode: otp,
      );

      await _authService.updatePhoneNumber(credential);

      state = state.copyWith(isLoading: false, verificationId: null);
      return true;
    } on FirebaseAuthException catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: _getIndonesianError(e.code),
      );
      return false;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: _getIndonesianError(e.toString()),
      );
      return false;
    }
  }

  /// Reauthenticate with Google
  Future<bool> reauthenticateWithGoogle() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await _authService.reauthenticateWithGoogle();
      state = state.copyWith(isLoading: false);
      return true;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: _getIndonesianError(e.toString()),
      );
      return false;
    }
  }

  /// Start phone reauthentication
  Future<bool> startReauthentication(String phoneNumber) async {
    state = state.copyWith(isLoading: true, error: null);

    // Format phone number
    String formattedNumber = PhoneFormatter.normalizeIndonesian(phoneNumber);

    try {
      await _authService.verifyPhoneForLinking(
        phoneNumber: formattedNumber,
        verificationCompleted: (credential) {},
        verificationFailed: (e) {
          state = state.copyWith(
            isLoading: false,
            error: _getIndonesianError(e.code),
          );
        },
        codeSent: (verificationId, resendToken) {
          state = state.copyWith(
            isLoading: false,
            verificationId: verificationId,
            phoneNumber: phoneNumber,
          );
        },
        codeAutoRetrievalTimeout: (verificationId) {},
      );
      return true;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: _getIndonesianError(e.toString()),
      );
      return false;
    }
  }

  /// Verify OTP for reauthentication
  Future<bool> verifyReauthOTP(String otp) async {
    if (state.verificationId == null) return false;

    state = state.copyWith(isLoading: true, error: null);

    try {
      final credential = PhoneAuthProvider.credential(
        verificationId: state.verificationId!,
        smsCode: otp,
      );

      await _authService.reauthenticateWithPhone(credential);

      state = state.copyWith(isLoading: false, verificationId: null);
      return true;
    } on FirebaseAuthException catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: _getIndonesianError(e.code),
      );
      return false;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: _getIndonesianError(e.toString()),
      );
      return false;
    }
  }

  /// Map Firebase Auth errors to Indonesian
  String _getIndonesianError(String error) {
    final msg = error.toLowerCase();

    if (msg.contains('invalid-phone-number')) {
      return 'Nomor telepon tidak valid. Periksa kembali nomor Anda.';
    }
    if (msg.contains('too-many-requests')) {
      return 'Terlalu banyak percobaan. Silakan tunggu sebentar dan coba lagi.';
    }
    if (msg.contains('credential-already-in-use')) {
      return 'Nomor telepon sudah digunakan oleh akun lain.';
    }
    if (msg.contains('invalid-verification-code')) {
      return 'Kode OTP yang Anda masukkan salah.';
    }
    if (msg.contains('expired-action-code')) {
      return 'Kode verifikasi sudah kadaluarsa. Silakan kirim ulang.';
    }
    if (msg.contains('internal-error')) {
      return 'Terjadi kesalahan sistem. Pastikan internet stabil atau hubungi admin.';
    }
    if (msg.contains('network-request-failed')) {
      return 'Koneksi internet bermasalah. Periksa jaringan Anda.';
    }
    if (msg.contains('captcha-check-failed')) {
      return 'Verifikasi keamanan gagal. Silakan coba lagi.';
    }
    if (msg.contains('app-not-authorized')) {
      return 'Aplikasi tidak terotorisasi. (Periksa SHA-1 Fingerprint)';
    }
    if (msg.contains('requires-recent-login')) {
      return 'Keamanan: Silakan login ulang untuk mengubah data ini.';
    }
    if (msg.contains('operation-not-allowed')) {
      return 'Metode login ini belum diaktifkan.';
    }
    if (msg.contains('user-disabled')) {
      return 'Akun Anda telah dinonaktifkan.';
    }
    if (msg.contains('user-not-found')) {
      return 'Akun tidak ditemukan.';
    }

    // Default error
    return 'Terjadi kesalahan: $error';
  }

  /// Sign out
  Future<void> signOut() async {
    await _authService.signOut();
    state = AuthState.initial();
  }

  /// Reload user data
  Future<void> reloadUser() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user != null) {
      await user.reload();
      // State changes will be picked up by authStateProvider stream
    }
  }

  /// Reset state
  void reset() {
    state = AuthState.initial();
  }
}

/// Auth state class
class AuthState {
  final bool isLoading;
  final String? error;
  final String? verificationId;
  final String? phoneNumber;
  final bool isLoggedIn;

  AuthState({
    required this.isLoading,
    this.error,
    this.verificationId,
    this.phoneNumber,
    required this.isLoggedIn,
  });

  factory AuthState.initial() {
    return AuthState(
      isLoading: false,
      error: null,
      verificationId: null,
      phoneNumber: null,
      isLoggedIn: false,
    );
  }

  AuthState copyWith({
    bool? isLoading,
    String? error,
    String? verificationId,
    String? phoneNumber,
    bool? isLoggedIn,
  }) {
    return AuthState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      verificationId: verificationId ?? this.verificationId,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      isLoggedIn: isLoggedIn ?? this.isLoggedIn,
    );
  }
}

/// Provider for AuthNotifier
final authNotifierProvider = StateNotifierProvider<AuthNotifier, AuthState>((
  ref,
) {
  return AuthNotifier(ref.watch(authServiceProvider));
});
