import 'dart:io';
import 'package:camera/camera.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_mlkit_text_recognition/google_mlkit_text_recognition.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lottie/lottie.dart';
import '../models/product.dart';
import '../services/audio_service.dart';

class TextScannerDialog extends ConsumerStatefulWidget {
  final List<Product> products;
  final bool rawTextOnly;
  const TextScannerDialog({
    super.key,
    required this.products,
    this.rawTextOnly = false,
  });

  @override
  ConsumerState<TextScannerDialog> createState() => _TextScannerDialogState();
}

class _TextScannerDialogState extends ConsumerState<TextScannerDialog> {
  CameraController? _controller;
  final TextRecognizer _textRecognizer = TextRecognizer();
  bool _isBusy = false;
  bool _isFound = false;
  String _lastRecognized = "";
  DateTime _lastProcessTime = DateTime.now();

  @override
  void initState() {
    super.initState();
    _initializeCamera();
  }

  @override
  void dispose() {
    _controller?.dispose();
    _textRecognizer.close();
    super.dispose();
  }

  Future<void> _initializeCamera() async {
    final cameras = await availableCameras();
    if (cameras.isEmpty) return;

    _controller = CameraController(
      cameras[0],
      ResolutionPreset.high,
      enableAudio: false,
      imageFormatGroup: Platform.isAndroid
          ? ImageFormatGroup.nv21
          : ImageFormatGroup.bgra8888,
    );

    try {
      await _controller?.initialize();
      if (!mounted) return;

      _controller?.startImageStream(_processCameraImage);
      setState(() {});
    } catch (e) {
      debugPrint('Error initializing camera: $e');
    }
  }

  void _processCameraImage(CameraImage image) async {
    if (_isBusy || _isFound) return;

    // Throttle: Process every 600ms for better responsiveness
    final now = DateTime.now();
    if (now.difference(_lastProcessTime).inMilliseconds < 600) return;

    _isBusy = true;
    _lastProcessTime = now;

    try {
      if (!mounted) return;
      final inputImage = _getInputImage(image);
      final recognizedText = await _textRecognizer.processImage(inputImage);

      String foundLine = "";
      Product? matchedProduct;

      // Plan A: Check line by line for faster & more accurate matching
      for (TextBlock block in recognizedText.blocks) {
        for (TextLine line in block.lines) {
          final lineText = line.text.toLowerCase().trim();
          if (lineText.length < 3) continue;

          for (Product product in widget.products) {
            final pName = product.name.toLowerCase();
            // Match line to product or vice versa
            if (lineText.contains(pName) || pName.contains(lineText)) {
              matchedProduct = product;
              foundLine = line.text;
              break;
            }
          }
          if (matchedProduct != null) break;
        }
        if (matchedProduct != null) break;
      }

      if (matchedProduct != null) {
        setState(() => _lastRecognized = foundLine);
        _handleMatch(matchedProduct);
      } else {
        // Plan B: Update feedback with the most prominent block found
        if (recognizedText.blocks.isNotEmpty) {
          final topText = recognizedText.blocks.first.text;
          setState(() {
            _lastRecognized = topText.trim();
          });
        }
      }
    } catch (e) {
      debugPrint('Error processing image: $e');
    } finally {
      _isBusy = false;
    }
  }

  void _handleMatch(Product product) {
    if (_isFound) return;
    setState(() => _isFound = true);
    HapticFeedback.mediumImpact();
    ref.read(audioServiceProvider).playBeep();
    Navigator.of(context).pop(product);
  }

  InputImage _getInputImage(CameraImage image) {
    final WriteBuffer allBytes = WriteBuffer();
    for (final Plane plane in image.planes) {
      allBytes.putUint8List(plane.bytes);
    }
    final bytes = allBytes.done().buffer.asUint8List();

    final Size imageSize = Size(
      image.width.toDouble(),
      image.height.toDouble(),
    );
    final imageRotation =
        InputImageRotationValue.fromRawValue(
          _controller!.description.sensorOrientation,
        ) ??
        InputImageRotation.rotation0deg;
    final inputImageFormat =
        InputImageFormatValue.fromRawValue(image.format.raw) ??
        InputImageFormat.nv21;

    final metadata = InputImageMetadata(
      size: imageSize,
      rotation: imageRotation,
      format: inputImageFormat,
      bytesPerRow: image.planes[0].bytesPerRow,
    );

    return InputImage.fromBytes(bytes: bytes, metadata: metadata);
  }

  @override
  Widget build(BuildContext context) {
    if (_controller == null || !_controller!.value.isInitialized) {
      return Center(
        child: Lottie.asset(
          'assets/loading_dots_blue.json',
          width: 100,
          height: 100,
        ),
      );
    }

    return AlertDialog(
      title: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            'Scan Nama Barang',
            style: GoogleFonts.outfit(
              fontWeight: FontWeight.w600,
              fontSize: 18,
            ),
          ),
          const Icon(Icons.text_fields, color: Color(0xFFC5A059)),
        ],
      ),
      contentPadding: EdgeInsets.zero,
      content: SizedBox(
        width: MediaQuery.of(context).size.width * 0.8,
        height: MediaQuery.of(context).size.height * 0.5,
        child: Stack(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: SizedBox(
                width: double.infinity,
                height: double.infinity,
                child: FittedBox(
                  fit: BoxFit.cover,
                  child: SizedBox(
                    width: _controller!.value.previewSize!.height,
                    height: _controller!.value.previewSize!.width,
                    child: CameraPreview(_controller!),
                  ),
                ),
              ),
            ),
            // Overlay scanning effect
            Positioned.fill(
              child: Container(
                decoration: BoxDecoration(
                  border: Border.all(
                    color: const Color(0xFFC5A059).withOpacity(0.5),
                    width: 2,
                  ),
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
            // Bottom feedback
            Positioned(
              bottom: 10,
              left: 10,
              right: 10,
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 5,
                ),
                decoration: BoxDecoration(
                  color: Colors.black54,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Lottie.asset(
                      'assets/loading_dots_blue.json',
                      width: 40,
                      height: 40,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _lastRecognized.isEmpty
                            ? 'Arahkan ke tulisan nama barang...'
                            : 'Membaca: $_lastRecognized',
                        style: GoogleFonts.outfit(
                          color: Colors.white,
                          fontSize: 12,
                        ),
                        textAlign: TextAlign.center,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
      actions: [
        if (_lastRecognized.isNotEmpty)
          ElevatedButton(
            onPressed: () {
              _isFound = true;
              Navigator.of(context).pop(_lastRecognized);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF0B192C),
              foregroundColor: Colors.white,
            ),
            child: const Text('Gunakan Teks'),
          ),
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Batal'),
        ),
      ],
    );
  }
}
