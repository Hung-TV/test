import 'package:flutter/material.dart';
import '../../../core/localization/app_translations.dart';
import '../../../common/theme/app_colors.dart';
import '../../../common/widgets/handwriting_canvas.dart';
import '../../../core/services/handwriting_recognizer.dart' as hr;
import '../../../core/services/handwriting_templates.dart';

/// Dialog vẽ tay viết chữ Kanji/Kana hoạt động hoàn toàn offline.
class HandwritingDialog extends StatefulWidget {
  final TextEditingController searchController;
  final Function(String) onSearch;

  const HandwritingDialog({
    super.key,
    required this.searchController,
    required this.onSearch,
  });

  @override
  State<HandwritingDialog> createState() => _HandwritingDialogState();
}

class _HandwritingDialogState extends State<HandwritingDialog> {
  final HandwritingCanvasController _canvasController = HandwritingCanvasController();
  List<String> _candidates = [];


  void _clearCanvas() {
    _canvasController.clear();
    setState(() {
      _candidates.clear();
    });
  }

  void _clearSearchText() {
    setState(() {
      widget.searchController.clear();
    });
    widget.onSearch('');
  }

  void _backspaceSearchText() {
    final text = widget.searchController.text;
    if (text.isNotEmpty) {
      final newText = text.substring(0, text.length - 1);
      setState(() {
        widget.searchController.text = newText;
      });
      widget.onSearch(newText);
    }
  }

  /// Hàm nhận diện được gọi real-time sau mỗi nét vẽ (onStrokeComplete)
  void _recognizeOffline(List<List<Offset>> strokes) {
    if (strokes.isEmpty) return;

    try {
      // 1. Chuyển đổi cấu trúc dữ liệu nét vẽ (Offset sang Point dùng cho thuật toán $P)
      List<List<hr.Point>> recognizerStrokes = [];
      for (int i = 0; i < strokes.length; i++) {
        List<hr.Point> recognizerStroke = [];
        for (var offset in strokes[i]) {
          recognizerStroke.add(hr.Point(offset.dx, offset.dy, i));
        }
        recognizerStrokes.add(recognizerStroke);
      }

      // 2. Chạy so khớp thuật toán $P offline với bộ mẫu mặc định
      final results = hr.HandwritingRecognizer.recognize(
        recognizerStrokes,
        HandwritingTemplates.defaultTemplates,
      );

      setState(() {
        _candidates = results;
      });
    } catch (e) {
      debugPrint('Lỗi nhận diện vẽ tay offline: $e');
    }
  }

  void _selectCandidate(String char) {
    setState(() {
      // Gán từ gợi ý vào ô tìm kiếm (ghép tiếp vào từ đang nhập)
      widget.searchController.text = widget.searchController.text + char;
    });
    // Kích hoạt tìm kiếm cập nhật ra màn hình chính
    widget.onSearch(widget.searchController.text);
    // Clear toàn bộ bảng vẽ hiện tại để chuẩn bị vẽ chữ tiếp theo
    _clearCanvas();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      backgroundColor: AppColors.surface,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      title: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              const Icon(Icons.edit, color: AppColors.primary),
              const SizedBox(width: 8),
              Text(
                AppTranslations.get(context, 'kanji', 'handwritingSearch'),
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
              ),
            ],
          ),
          IconButton(
            icon: const Icon(Icons.close, color: AppColors.textMuted),
            onPressed: () => Navigator.pop(context),
          ),
        ],
      ),
      contentPadding: const EdgeInsets.fromLTRB(16, 4, 16, 4),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Hiển thị ô văn bản đang nhập kèm nút xóa/backspace
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.surfaceContainer,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.outlineVariant),
            ),
            child: Row(
              children: [
                Expanded(
                  child: AnimatedBuilder(
                    animation: widget.searchController,
                    builder: (context, child) {
                      return Text(
                        widget.searchController.text.isEmpty
                            ? AppTranslations.get(context, 'kanji', 'typing')
                            : widget.searchController.text,
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: widget.searchController.text.isEmpty
                              ? AppColors.textMuted
                              : AppColors.textPrimary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      );
                    },
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.backspace, color: AppColors.primary, size: 20),
                  tooltip: AppTranslations.get(context, 'kanji', 'deleteLastChar'),
                  onPressed: _backspaceSearchText,
                ),
                IconButton(
                  icon: const Icon(Icons.clear, color: AppColors.error, size: 20),
                  tooltip: AppTranslations.get(context, 'kanji', 'clearAllChars'),
                  onPressed: _clearSearchText,
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          // Bảng vẽ HandwritingCanvas
          HandwritingCanvas(
            controller: _canvasController,
            height: 240,
            width: 240,
            strokeColor: AppColors.primary,
            strokeWidth: 6.0,
            onStrokeComplete: _recognizeOffline,
            decoration: BoxDecoration(
              color: AppColors.surfaceContainer,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.outlineVariant, width: 2),
            ),
          ),
          const SizedBox(height: 8),
          // Thanh gợi ý nằm ngang
          Container(
            height: 48,
            alignment: Alignment.center,
            child: _candidates.isEmpty
                    ? Text(
                        AppTranslations.get(context, 'kanji', 'drawInBox'),
                        style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                        textAlign: TextAlign.center,
                      )
                    : SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: _candidates.map((cand) {
                            return Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 4.0),
                              child: ElevatedButton(
                                onPressed: () => _selectCandidate(cand),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppColors.primary, // Nền xanh chính đậm nét
                                  foregroundColor: Colors.white,      // Chữ trắng nổi bật tương phản cao
                                  elevation: 3,                        // Hiển thị nút dạng nổi 3D
                                  padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                ),
                                child: Text(
                                  cand,
                                  style: const TextStyle(
                                    fontSize: 20,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                      ),
          ),
        ],
      ),
      actionsPadding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
      actions: [
        OutlinedButton(
          onPressed: _clearCanvas,
          style: OutlinedButton.styleFrom(
            foregroundColor: AppColors.error,
            side: const BorderSide(color: AppColors.error),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
          child: Text(AppTranslations.get(context, 'kanji', 'clearDrawing')),
        ),
        ElevatedButton(
          onPressed: () => Navigator.pop(context),
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
          child: Text(AppTranslations.get(context, 'kanji', 'done')),
        ),
      ],
    );
  }
}
