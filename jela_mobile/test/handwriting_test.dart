import 'package:flutter_test/flutter_test.dart';
import 'package:jela_mobile/core/services/handwriting_recognizer.dart';
import 'package:jela_mobile/core/services/handwriting_templates.dart';

void main() {
  group('Handwriting Recognizer & Algorithm \$P Tests', () {
    test('Normalization should resample points to exactly 32 points', () {
      final List<Point> rawPoints = [
        Point(10, 10, 0),
        Point(20, 20, 0),
        Point(30, 30, 0),
        Point(40, 40, 0),
        Point(50, 50, 0),
      ];

      final normalized = HandwritingRecognizer.normalize(rawPoints);

      // Verify that the points are resampled to numPoints (32)
      expect(normalized.length, equals(HandwritingRecognizer.numPoints));
    });

    test('Recognition should correctly identify a template matched against itself', () {
      // Pick the '木' (tree) template raw points from our predefined list
      final treeTemplate = HandwritingTemplates.defaultTemplates
          .firstWhere((t) => t.label == '木');

      // Reconstruct input strokes from the template points grouped by strokeId
      final Map<int, List<Point>> strokeGroups = {};
      for (var p in treeTemplate.points) {
        strokeGroups.putIfAbsent(p.strokeId, () => []).add(p);
      }
      final List<List<Point>> rawInput = strokeGroups.values.toList();

      final candidates = HandwritingRecognizer.recognize(
        rawInput,
        HandwritingTemplates.defaultTemplates,
      );

      // The top result (first candidate) must be '木'
      expect(candidates.isNotEmpty, isTrue);
      expect(candidates.first, equals('木'));
    });

    test('Recognition should correctly identify Hiraganaし matched against itself', () {
      final List<List<Point>> rawInput = [
        [Point(50, 20, 0), Point(50, 70, 0), Point(60, 80, 0), Point(75, 75, 0)],
      ];

      final candidates = HandwritingRecognizer.recognize(
        rawInput,
        HandwritingTemplates.defaultTemplates,
      );

      expect(candidates.isNotEmpty, isTrue);
      expect(candidates.first, equals('し'));
    });
  });
}
