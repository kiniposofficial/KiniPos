import 'package:flutter/material.dart';

class OrganicBackground extends StatelessWidget {
  const OrganicBackground({super.key});

  @override
  Widget build(BuildContext context) {
    return CustomPaint(painter: _OrganicPainter(), size: Size.infinite);
  }
}

class _OrganicPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFF009688)
          .withOpacity(0.05) // Teal with low opacity
      ..style = PaintingStyle.fill;

    final path1 = Path();
    path1.moveTo(0, size.height * 0.3);
    path1.quadraticBezierTo(
      size.width * 0.25,
      size.height * 0.35,
      size.width * 0.5,
      size.height * 0.2,
    );
    path1.quadraticBezierTo(
      size.width * 0.75,
      size.height * 0.05,
      size.width,
      size.height * 0.25,
    );
    path1.lineTo(size.width, 0);
    path1.lineTo(0, 0);
    path1.close();

    canvas.drawPath(path1, paint);

    final paint2 = Paint()
      ..color = const Color(0xFF009688).withOpacity(0.08)
      ..style = PaintingStyle.fill;

    final path2 = Path();
    path2.moveTo(0, size.height);
    path2.quadraticBezierTo(
      size.width * 0.25,
      size.height * 0.85,
      size.width * 0.5,
      size.height * 0.95,
    );
    path2.quadraticBezierTo(
      size.width * 0.75,
      size.height * 1.05, // Go slightly off screen
      size.width,
      size.height * 0.9,
    );
    path2.lineTo(size.width, size.height);
    path2.lineTo(0, size.height);
    path2.close();

    canvas.drawPath(path2, paint2);

    // Decorative Circle 1
    canvas.drawCircle(
      Offset(size.width * 0.9, size.height * 0.15),
      60,
      Paint()..color = Colors.orange.withOpacity(0.05),
    );

    // Decorative Circle 2
    canvas.drawCircle(
      Offset(size.width * 0.1, size.height * 0.85),
      40,
      Paint()..color = Colors.blue.withOpacity(0.05),
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
