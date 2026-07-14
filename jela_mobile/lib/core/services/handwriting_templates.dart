import 'handwriting_recognizer.dart';

/// Bộ dữ liệu mẫu chữ viết tay đóng gói sẵn trong ứng dụng (Offline).
/// Chứa tọa độ các nét vẽ thô đã được chuẩn hóa tự động qua lớp HandwritingRecognizer.
class HandwritingTemplates {
  static final List<GestureTemplate> defaultTemplates = [
    // --- KANJI CƠ BẢN ---
    GestureTemplate(
      label: '一',
      rawPoints: [
        Point(15, 50, 0), Point(85, 50, 0),
      ],
    ),
    GestureTemplate(
      label: '二',
      rawPoints: [
        Point(25, 35, 0), Point(75, 35, 0),
        Point(15, 65, 1), Point(85, 65, 1),
      ],
    ),
    GestureTemplate(
      label: '三',
      rawPoints: [
        Point(25, 25, 0), Point(75, 25, 0),
        Point(30, 50, 1), Point(70, 50, 1),
        Point(15, 75, 2), Point(85, 75, 2),
      ],
    ),
    GestureTemplate(
      label: '十',
      rawPoints: [
        Point(15, 50, 0), Point(85, 50, 0),
        Point(50, 15, 1), Point(50, 85, 1),
      ],
    ),
    GestureTemplate(
      label: '人',
      rawPoints: [
        Point(50, 15, 0), Point(35, 45, 0), Point(15, 80, 0),
        Point(45, 45, 1), Point(65, 65, 1), Point(85, 80, 1),
      ],
    ),
    GestureTemplate(
      label: '川',
      rawPoints: [
        Point(25, 20, 0), Point(20, 80, 0),
        Point(50, 20, 1), Point(50, 80, 1),
        Point(75, 15, 2), Point(80, 85, 2),
      ],
    ),
    GestureTemplate(
      label: '山',
      rawPoints: [
        Point(50, 15, 0), Point(50, 80, 0),
        Point(20, 40, 1), Point(20, 80, 1), Point(80, 80, 1),
        Point(80, 40, 2), Point(80, 80, 2),
      ],
    ),
    GestureTemplate(
      label: '口',
      rawPoints: [
        Point(25, 25, 0), Point(25, 75, 0), // Nét 1 dọc trái
        Point(25, 25, 1), Point(75, 25, 1), Point(75, 75, 1), // Nét 2 gập ngang dọc phải
        Point(25, 75, 2), Point(75, 75, 2), // Nét 3 ngang đáy
      ],
    ),
    GestureTemplate(
      label: '日',
      rawPoints: [
        Point(25, 20, 0), Point(25, 80, 0),
        Point(25, 20, 1), Point(75, 20, 1), Point(75, 80, 1),
        Point(25, 50, 2), Point(75, 50, 2),
        Point(25, 80, 3), Point(75, 80, 3),
      ],
    ),
    GestureTemplate(
      label: '木',
      rawPoints: [
        Point(15, 35, 0), Point(85, 35, 0),
        Point(50, 15, 1), Point(50, 85, 1),
        Point(50, 35, 2), Point(25, 75, 2),
        Point(50, 35, 3), Point(75, 75, 3),
      ],
    ),

    // --- HIRAGANA PHỔ BIẾN ---
    GestureTemplate(
      label: 'し',
      rawPoints: [
        Point(50, 20, 0), Point(50, 70, 0), Point(60, 80, 0), Point(75, 75, 0),
      ],
    ),
    GestureTemplate(
      label: 'く',
      rawPoints: [
        Point(70, 30, 0), Point(30, 50, 0), Point(70, 70, 0),
      ],
    ),
    GestureTemplate(
      label: 'つ',
      rawPoints: [
        Point(25, 35, 0), Point(70, 35, 0), Point(65, 65, 0), Point(40, 75, 0),
      ],
    ),
    GestureTemplate(
      label: 'へ',
      rawPoints: [
        Point(20, 65, 0), Point(45, 35, 0), Point(80, 60, 0),
      ],
    ),
    GestureTemplate(
      label: 'い',
      rawPoints: [
        Point(30, 30, 0), Point(28, 55, 0), Point(35, 65, 0),
        Point(70, 35, 1), Point(72, 55, 1),
      ],
    ),
    GestureTemplate(
      label: 'こ',
      rawPoints: [
        Point(30, 35, 0), Point(70, 33, 0), Point(60, 43, 0),
        Point(33, 65, 1), Point(70, 63, 1),
      ],
    ),
    GestureTemplate(
      label: 'り',
      rawPoints: [
        Point(35, 25, 0), Point(35, 55, 0), Point(40, 50, 0),
        Point(65, 20, 1), Point(65, 80, 1), Point(60, 70, 1),
      ],
    ),
    GestureTemplate(
      label: 'て',
      rawPoints: [
        Point(25, 30, 0), Point(75, 30, 0), Point(45, 55, 0), Point(48, 75, 0),
      ],
    ),
    GestureTemplate(
      label: 'の',
      rawPoints: [
        Point(55, 35, 0), Point(35, 65, 0), Point(55, 75, 0), Point(75, 55, 0), Point(60, 35, 0), Point(40, 50, 0),
      ],
    ),
    GestureTemplate(
      label: 'う',
      rawPoints: [
        Point(40, 20, 0), Point(60, 23, 0),
        Point(35, 45, 1), Point(65, 45, 1), Point(60, 75, 1), Point(40, 80, 1),
      ],
    ),

    // --- KATAKANA PHỔ BIẾN ---
    GestureTemplate(
      label: 'ア',
      rawPoints: [
        Point(25, 25, 0), Point(75, 25, 0), Point(55, 45, 0),
        Point(50, 35, 1), Point(30, 75, 1),
      ],
    ),
    GestureTemplate(
      label: 'イ',
      rawPoints: [
        Point(65, 20, 0), Point(35, 55, 0),
        Point(50, 38, 1), Point(50, 85, 1),
      ],
    ),
    GestureTemplate(
      label: 'ウ',
      rawPoints: [
        Point(50, 15, 0), Point(50, 30, 0),
        Point(25, 45, 1), Point(27, 60, 1),
        Point(25, 45, 2), Point(75, 45, 2), Point(70, 80, 2),
      ],
    ),
    GestureTemplate(
      label: 'エ',
      rawPoints: [
        Point(30, 25, 0), Point(70, 25, 0),
        Point(50, 25, 1), Point(50, 75, 1),
        Point(20, 75, 2), Point(80, 75, 2),
      ],
    ),
    GestureTemplate(
      label: 'オ',
      rawPoints: [
        Point(20, 40, 0), Point(80, 40, 0),
        Point(50, 15, 1), Point(50, 80, 1), Point(40, 75, 1),
        Point(50, 45, 2), Point(25, 75, 2),
      ],
    ),
    GestureTemplate(
      label: 'ト',
      rawPoints: [
        Point(50, 20, 0), Point(50, 80, 0),
        Point(50, 45, 1), Point(75, 65, 1),
      ],
    ),
    GestureTemplate(
      label: 'ハ',
      rawPoints: [
        Point(35, 30, 0), Point(20, 70, 0),
        Point(65, 30, 1), Point(80, 70, 1),
      ],
    ),
    GestureTemplate(
      label: 'ニ',
      rawPoints: [
        Point(25, 35, 0), Point(75, 35, 0),
        Point(20, 65, 1), Point(80, 65, 1),
      ],
    ),
  ];
}
