import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final audioServiceProvider = Provider((ref) => AudioService());

class AudioService {
  final AudioPlayer _player = AudioPlayer();

  AudioService() {
    // Optional: Preload the asset if the package supports it efficiently
    // In audioplayers 6.x, we just use AssetSource
  }

  Future<void> playBeep() async {
    try {
      await _player.play(AssetSource('beep.wav'));
    } catch (e) {
      debugPrint('Error playing beep: $e');
    }
  }

  void dispose() {
    _player.dispose();
  }
}
