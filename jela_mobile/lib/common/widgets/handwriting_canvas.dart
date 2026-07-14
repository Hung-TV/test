import 'package:flutter/material.dart';

/// Controller dùng để quản lý trạng thái và thao tác với bảng vẽ từ widget cha.
class HandwritingCanvasController {
  VoidCallback? _clearCallback;
  List<List<Offset>> Function()? _getStrokesCallback;

  /// Xóa sạch các nét đã vẽ trên bảng canvas.
  void clear() {
    _clearCallback?.call();
  }

  /// Lấy toàn bộ tọa độ các nét vẽ hiện tại.
  List<List<Offset>> get strokes => _getStrokesCallback?.call() ?? [];
}

/// Widget bảng vẽ viết tay có thể tái sử dụng cho từ điển hoặc tra cứu Kanji.
class HandwritingCanvas extends StatefulWidget {
  final HandwritingCanvasController? controller;
  final Function(List<List<Offset>> strokes)? onStrokeComplete;
  final Color strokeColor;
  final double strokeWidth;
  final double height;
  final double width;
  final Decoration? decoration;

  const HandwritingCanvas({
    super.key,
    this.controller,
    this.onStrokeComplete,
    this.strokeColor = Colors.blue,
    this.strokeWidth = 5.0,
    required this.height,
    required this.width,
    this.decoration,
  });

  @override
  State<HandwritingCanvas> createState() => _HandwritingCanvasState();
}

class _HandwritingCanvasState extends State<HandwritingCanvas> {
  final List<List<Offset>> _strokes = [];

  @override
  void initState() {
    super.initState();
    if (widget.controller != null) {
      widget.controller!._clearCallback = _clear;
      widget.controller!._getStrokesCallback = _getStrokes;
    }
  }

  void _clear() {
    setState(() {
      _strokes.clear();
    });
  }

  List<List<Offset>> _getStrokes() {
    return _strokes;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: widget.width,
      height: widget.height,
      decoration: widget.decoration,
      child: GestureDetector(
        onPanStart: (details) {
          setState(() {
            _strokes.add([details.localPosition]);
          });
        },
        onPanUpdate: (details) {
          if (_strokes.isNotEmpty) {
            final localPos = details.localPosition;
            
            // Chỉ thêm điểm vẽ nếu điểm đó nằm trong khu vực giới hạn của canvas
            if (localPos.dx >= 0 &&
                localPos.dx <= widget.width &&
                localPos.dy >= 0 &&
                localPos.dy <= widget.height) {
              setState(() {
                _strokes.last.add(localPos);
              });
            }
          }
        },
        onPanEnd: (details) {
          if (widget.onStrokeComplete != null) {
            // Trả về bản sao sâu (deep-copy) các nét vẽ để tránh sửa đổi bất đồng bộ ngoài widget
            final List<List<Offset>> strokesCopy = _strokes
                .map((stroke) => List<Offset>.from(stroke))
                .toList();
            widget.onStrokeComplete!(strokesCopy);
          }
        },
        child: CustomPaint(
          painter: _HandwritingPainter(
            strokes: _strokes,
            strokeColor: widget.strokeColor,
            strokeWidth: widget.strokeWidth,
          ),
          size: Size(widget.width, widget.height),
        ),
      ),
    );
  }
}

class _HandwritingPainter extends CustomPainter {
  final List<List<Offset>> strokes;
  final Color strokeColor;
  final double strokeWidth;

  _HandwritingPainter({
    required this.strokes,
    required this.strokeColor,
    required this.strokeWidth,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = strokeColor
      ..strokeCap = StrokeCap.round
      ..strokeWidth = strokeWidth
      ..style = PaintingStyle.stroke;

    for (int i = 0; i < strokes.length; i++) {
      final stroke = strokes[i];
      if (stroke.isEmpty) continue;
      
      final path = Path()..moveTo(stroke[0].dx, stroke[0].dy);
      for (int j = 1; j < stroke.length; j++) {
        path.lineTo(stroke[j].dx, stroke[j].dy);
      }
      canvas.drawPath(path, paint);
    }
  }

  @override
  bool shouldRepaint(covariant _HandwritingPainter oldDelegate) => true;
}
