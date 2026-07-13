import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import '../models/user_model.dart';

/// AuthService handles Firebase Phone Authentication
class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final GoogleSignIn _googleSignIn = GoogleSignIn(
    clientId:
        '1060095869219-49nltsp5tftq187lgiikpc6r01upheg2.apps.googleusercontent.com',
    serverClientId: kIsWeb
        ? null
        : '1060095869219-49nltsp5tftq187lgiikpc6r01upheg2.apps.googleusercontent.com',
  );
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  /// Get current user
  User? get currentUser => _auth.currentUser;

  /// Stream of auth state changes
  Stream<User?> get authStateChanges => _auth.authStateChanges();

  /// Send OTP to phone number
  Future<void> sendOTP({
    required String phoneNumber,
    required Function(String verificationId) onCodeSent,
    required Function(String error) onError,
    required Function(PhoneAuthCredential credential) onAutoVerify,
  }) async {
    try {
      await _auth.verifyPhoneNumber(
        phoneNumber: phoneNumber,
        timeout: const Duration(seconds: 60),
        verificationCompleted: (PhoneAuthCredential credential) async {
          // Auto-verification (Android only)
          onAutoVerify(credential);
        },
        verificationFailed: (FirebaseAuthException e) {
          onError(e.message ?? 'Verification failed');
        },
        codeSent: (String verificationId, int? resendToken) {
          onCodeSent(verificationId);
        },
        codeAutoRetrievalTimeout: (String verificationId) {
          // Auto-retrieval timeout
        },
      );
    } catch (e) {
      onError(e.toString());
    }
  }

  /// Verify OTP and sign in
  Future<UserCredential?> verifyOTP({
    required String verificationId,
    required String otp,
  }) async {
    try {
      PhoneAuthCredential credential = PhoneAuthProvider.credential(
        verificationId: verificationId,
        smsCode: otp,
      );
      return await _auth.signInWithCredential(credential);
    } catch (e) {
      rethrow;
    }
  }

  /// Sign in with Google
  Future<UserCredential?> signInWithGoogle() async {
    try {
      // Force account picker by ensuring previous session is cleared
      await _googleSignIn.signOut();

      // Trigger the authentication flow
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) return null; // User canceled the sign-in

      // Obtain the auth details from the request
      final GoogleSignInAuthentication googleAuth =
          await googleUser.authentication;

      // Create a new credential
      final OAuthCredential credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      // Sign in to Firebase with the Google [UserCredential]
      return await _auth.signInWithCredential(credential);
    } catch (e) {
      rethrow;
    }
  }

  /// Sign in with credential (for auto-verification)
  Future<UserCredential?> signInWithCredential(
    AuthCredential credential,
  ) async {
    try {
      return await _auth.signInWithCredential(credential);
    } catch (e) {
      rethrow;
    }
  }

  /// Verify phone number for linking
  Future<void> verifyPhoneForLinking({
    required String phoneNumber,
    required void Function(PhoneAuthCredential) verificationCompleted,
    required void Function(FirebaseAuthException) verificationFailed,
    required void Function(String, int?) codeSent,
    required void Function(String) codeAutoRetrievalTimeout,
  }) async {
    await _auth.verifyPhoneNumber(
      phoneNumber: phoneNumber,
      verificationCompleted: verificationCompleted,
      verificationFailed: verificationFailed,
      codeSent: codeSent,
      codeAutoRetrievalTimeout: codeAutoRetrievalTimeout,
    );
  }

  /// Link credential to current user
  Future<UserCredential?> linkWithCredential(AuthCredential credential) async {
    final userCredential = await _auth.currentUser?.linkWithCredential(
      credential,
    );

    // Update Firestore profile with the new phone number
    if (userCredential?.user?.phoneNumber != null) {
      await _firestore.collection('users').doc(userCredential!.user!.uid).set({
        'phone': userCredential.user!.phoneNumber,
      }, SetOptions(merge: true));
    }

    return userCredential;
  }

  /// Update phone number
  Future<void> updatePhoneNumber(PhoneAuthCredential credential) async {
    await _auth.currentUser?.updatePhoneNumber(credential);

    // Update Firestore profile
    final user = _auth.currentUser;
    if (user?.phoneNumber != null) {
      await _firestore.collection('users').doc(user!.uid).set({
        'phone': user.phoneNumber,
      }, SetOptions(merge: true));
    }
  }

  /// Check if user profile exists in Firestore
  Future<bool> isProfileComplete() async {
    if (currentUser == null) return false;

    final doc = await _firestore
        .collection('users')
        .doc(currentUser!.uid)
        .get();

    if (!doc.exists) return false;

    final data = doc.data();
    return data != null &&
        data['ownerName'] != null &&
        data['ownerName'].toString().isNotEmpty &&
        data['businessName'] != null &&
        data['businessName'].toString().isNotEmpty;
  }

  /// Get user profile from Firestore
  Future<UserModel?> getUserProfile() async {
    if (currentUser == null) return null;

    final doc = await _firestore
        .collection('users')
        .doc(currentUser!.uid)
        .get();

    if (!doc.exists) return null;

    return UserModel.fromFirestore(doc.data()!, doc.id);
  }

  /// Watch user profile for real-time updates
  Stream<UserModel?> watchUserProfile() {
    if (currentUser == null) return Stream.value(null);

    return _firestore.collection('users').doc(currentUser!.uid).snapshots().map(
      (doc) {
        if (!doc.exists) return null;
        return UserModel.fromFirestore(doc.data()!, doc.id);
      },
    );
  }

  /// Check if phone number already exists
  Future<bool> checkPhoneExists(String phone) async {
    final query = await _firestore
        .collection('users')
        .where('phone', isEqualTo: phone)
        .limit(1)
        .get();
    return query.docs.isNotEmpty;
  }

  /// Create an initial profile doc to mark start of registration
  Future<void> createInitialProfile({String? phone}) async {
    final user = currentUser;
    if (user == null) return;

    await _firestore.collection('users').doc(user.uid).set({
      'phone': phone ?? user.phoneNumber ?? '',
      'createdAt': FieldValue.serverTimestamp(),
      'ownerName': '', // Mark as incomplete
      'businessName': '', // Mark as incomplete
    }, SetOptions(merge: true));
  }

  /// Create or update user profile in Firestore
  Future<void> saveUserProfile({
    required String ownerName,
    required String businessName,
    required String businessType,
    String? phone,
  }) async {
    final user = currentUser;
    if (user == null) throw Exception('User not logged in');

    final Map<String, dynamic> data = {
      'ownerName': ownerName,
      'businessName': businessName,
      'businessType': businessType,
    };

    // Only set createdAt if it doesn't exist
    final snapshot = await _firestore.collection('users').doc(user.uid).get();
    if (!snapshot.exists || snapshot.data()?['createdAt'] == null) {
      data['createdAt'] = FieldValue.serverTimestamp();
    }

    if (phone != null) data['phone'] = phone;

    // Always try to save current user's phone if available from auth
    if (user.phoneNumber != null && phone == null) {
      data['phone'] = user.phoneNumber!;
    }

    await _firestore
        .collection('users')
        .doc(user.uid)
        .set(data, SetOptions(merge: true));
  }

  /// Reauthenticate with Google
  Future<void> reauthenticateWithGoogle() async {
    final user = _auth.currentUser;
    if (user == null) throw Exception('User not logged in');

    // Force sign in to get fresh credential
    await _googleSignIn.signOut();
    final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
    if (googleUser == null) throw Exception('Re-authentication cancelled');

    final GoogleSignInAuthentication googleAuth =
        await googleUser.authentication;
    final AuthCredential credential = GoogleAuthProvider.credential(
      accessToken: googleAuth.accessToken,
      idToken: googleAuth.idToken,
    );

    await user.reauthenticateWithCredential(credential);
  }

  /// Reauthenticate with Phone
  Future<void> reauthenticateWithPhone(PhoneAuthCredential credential) async {
    final user = _auth.currentUser;
    if (user == null) throw Exception('User not logged in');
    await user.reauthenticateWithCredential(credential);
  }

  /// Sign out
  Future<void> signOut() async {
    await _auth.signOut();
  }
}
