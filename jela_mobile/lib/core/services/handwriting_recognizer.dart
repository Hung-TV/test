import 'dart:math' as math;

/// Đại diện cho một điểm tọa độ trong nét vẽ viết tay.
class Point {
  final double x;
  final double y;
  final int strokeId; // Định danh nét vẽ (nét thứ mấy của chữ)

  Point(this.x, this.y, this.strokeId);

  @override
  String toString() => 'Point($x, $y, $strokeId)';
}

/// Đại diện cho một mẫu chữ ký tự vẽ tay lưu trữ trong bộ nhớ đệm offline.
class GestureTemplate {
  final String label; // Ký tự kết quả (ví dụ: 'あ', '木')
  final List<Point> points; // Tập điểm vẽ đã chuẩn hóa

  GestureTemplate({
    required this.label,
    required List<Point> rawPoints,
  }) : points = HandwritingRecognizer.normalize(rawPoints);

  /// Khởi tạo một mẫu có sẵn từ dữ liệu đã chuẩn hóa (tăng tốc khởi động ứng dụng)
  GestureTemplate.preNormalized({
    required this.label,
    required this.points,
  });
}

/// Công cụ nhận diện chữ vẽ tay hoàn toàn offline bằng thuật toán $P Point-Cloud Recognizer.
class HandwritingRecognizer {
  static const int numPoints = 32; // Số điểm chuẩn hóa cho mỗi chữ vẽ tay

  /// So khớp tập nét vẽ hiện tại của người dùng với danh sách các mẫu.
  /// Trả về danh sách các ký tự gợi ý sắp xếp theo độ tương đồng giảm dần.
  static List<String> recognize(List<List<Point>> strokes, List<GestureTemplate> templates) {
    if (strokes.isEmpty || templates.isEmpty) return [];

    // Chuyển danh sách các nét vẽ thành một đám mây điểm duy nhất
    List<Point> rawPoints = [];
    for (int i = 0; i < strokes.length; i++) {
      for (var p in strokes[i]) {
        rawPoints.add(Point(p.x, p.y, i));
      }
    }

    if (rawPoints.isEmpty) return [];

    // Chuẩn hóa đám mây điểm đầu vào
    List<Point> normalizedInput = normalize(rawPoints);

    List<MapEntry<String, double>> scores = [];

    // So khớp với từng template mẫu
    for (var template in templates) {
      if (template.points.isEmpty) continue;
      
      double score = _greedyCloudMatch(normalizedInput, template.points);
      scores.add(MapEntry(template.label, score));
    }

    // Sắp xếp theo khoảng cách so khớp tăng dần (khoảng cách càng nhỏ càng giống)
    scores.sort((a, b) => a.value.compareTo(b.value));

    // Lấy tối đa 10 gợi ý hàng đầu, loại bỏ các chữ trùng lặp liên tiếp nếu có
    List<String> candidates = [];
    for (var entry in scores) {
      if (!candidates.contains(entry.key)) {
        candidates.add(entry.key);
      }
      if (candidates.length >= 10) break;
    }

    return candidates;
  }

  /// Chuẩn hóa toàn bộ tập điểm đầu vào thông qua 3 bước: Resample, Scale, Translate.
  static List<Point> normalize(List<Point> points) {
    List<Point> resampled = _resample(points, numPoints);
    List<Point> scaled = _scale(resampled);
    List<Point> translated = _translateToOrigin(scaled);
    return translated;
  }

  /// BƯỚC 1: Nội suy tập điểm vẽ để có độ phân giải đồng đều (đúng numPoints điểm).
  static List<Point> _resample(List<Point> points, int n) {
    if (points.isEmpty) return [];

    // 1. Loại bỏ các điểm trùng lặp liên tiếp để tránh d == 0
    List<Point> cleanPoints = [points.first];
    for (int i = 1; i < points.length; i++) {
      if (points[i].x != points[i - 1].x || 
          points[i].y != points[i - 1].y || 
          points[i].strokeId != points[i - 1].strokeId) {
        cleanPoints.add(points[i]);
      }
    }

    if (cleanPoints.length < 2) {
      return List.generate(n, (index) => Point(points.first.x, points.first.y, points.first.strokeId));
    }

    double pathLen = _pathLength(cleanPoints);
    if (pathLen < 0.1) {
      return List.generate(n, (index) => Point(points.first.x, points.first.y, points.first.strokeId));
    }

    double interval = pathLen / (n - 1);
    double accumulatedDistance = 0.0;
    List<Point> resampledPoints = [cleanPoints.first];
    
    int i = 1;
    Point current = cleanPoints.first;

    while (i < cleanPoints.length) {
      if (cleanPoints[i].strokeId == cleanPoints[i - 1].strokeId) {
        double d = _distance(current, cleanPoints[i]);
        if (accumulatedDistance + d >= interval) {
          // Tránh chia cho 0 nếu d cực nhỏ
          if (d < 1e-4) {
            current = cleanPoints[i];
            i++;
            continue;
          }
          double factor = (interval - accumulatedDistance) / d;
          double qx = current.x + factor * (cleanPoints[i].x - current.x);
          double qy = current.y + factor * (cleanPoints[i].y - current.y);
          Point q = Point(qx, qy, cleanPoints[i].strokeId);
          
          resampledPoints.add(q);
          current = q; // Di chuyển điểm hiện tại tới điểm nội suy mới
          accumulatedDistance = 0.0;
        } else {
          accumulatedDistance += d;
          current = cleanPoints[i];
          i++;
        }
      } else {
        // Đổi nét vẽ: nhảy sang điểm đầu tiên của nét mới
        current = cleanPoints[i];
        i++;
      }
    }

    // Đảm bảo số lượng điểm chính xác bằng n
    while (resampledPoints.length < n) {
      resampledPoints.add(cleanPoints.last);
    }
    if (resampledPoints.length > n) {
      resampledPoints = resampledPoints.sublist(0, n);
    }
    
    return resampledPoints;
  }

  /// BƯỚC 2: Co giãn đám mây điểm về khung đơn vị [0.0, 1.0] để khử sai lệch kích cỡ vẽ.
  static List<Point> _scale(List<Point> points) {
    if (points.isEmpty) return [];
    
    double minX = double.infinity;
    double maxX = -double.infinity;
    double minY = double.infinity;
    double maxY = -double.infinity;

    for (var p in points) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }

    double width = maxX - minX;
    double height = maxY - minY;

    if (width == 0) width = 1.0;
    if (height == 0) height = 1.0;

    // Chuẩn hóa tỷ lệ chữ dựa trên cạnh dài nhất
    double scaleFactor = math.max(width, height);

    List<Point> scaled = [];
    for (var p in points) {
      double sx = (p.x - minX) / scaleFactor;
      double sy = (p.y - minY) / scaleFactor;
      scaled.add(Point(sx, sy, p.strokeId));
    }
    return scaled;
  }

  /// BƯỚC 3: Tịnh tiến trọng tâm tập nét vẽ về tâm tọa độ (0, 0).
  static List<Point> _translateToOrigin(List<Point> points) {
    if (points.isEmpty) return [];
    
    double sumX = 0.0;
    double sumY = 0.0;
    for (var p in points) {
      sumX += p.x;
      sumY += p.y;
    }
    double centroidX = sumX / points.length;
    double centroidY = sumY / points.length;

    List<Point> translated = [];
    for (var p in points) {
      translated.add(Point(p.x - centroidX, p.y - centroidY, p.strokeId));
    }
    return translated;
  }

  /// So khớp sai số khoảng cách nhỏ nhất giữa đám mây điểm vẽ và mẫu (Greedy Matching).
  static double _greedyCloudMatch(List<Point> pts1, List<Point> pts2) {
    int n = pts1.length;
    double eps = 0.5;
    int step = (n * eps).floor();
    if (step < 1) step = 1;
    
    double minDistance = double.infinity;
    for (int i = 0; i < n; i += step) {
      double d1 = _cloudDistance(pts1, pts2, i);
      double d2 = _cloudDistance(pts2, pts1, i);
      if (d1 < minDistance) minDistance = d1;
      if (d2 < minDistance) minDistance = d2;
    }
    return minDistance;
  }

  /// Tính khoảng cách đám mây điểm bắt đầu từ một chỉ số cụ thể.
  static double _cloudDistance(List<Point> pts1, List<Point> pts2, int startIndex) {
    int n = pts1.length;
    List<bool> matched = List.filled(n, false);
    double sum = 0.0;
    int i = startIndex;

    do {
      int index = -1;
      double minD = double.infinity;
      for (int j = 0; j < n; j++) {
        if (!matched[j]) {
          double d = _distanceSquared(pts1[i], pts2[j]);
          if (d < minD) {
            minD = d;
            index = j;
          }
        }
      }
      
      if (index != -1) {
        matched[index] = true;
      }
      
      // Tính toán trọng số dựa trên thứ tự điểm để hỗ trợ giữ hướng vẽ
      double weight = 1.0 - ((i - startIndex + n) % n) / n;
      sum += weight * minD;
      i = (i + 1) % n;
    } while (i != startIndex);

    return sum;
  }

  /// Độ dài toàn bộ nét vẽ.
  static double _pathLength(List<Point> points) {
    double length = 0.0;
    for (int i = 1; i < points.length; i++) {
      if (points[i].strokeId == points[i - 1].strokeId) {
        length += _distance(points[i - 1], points[i]);
      }
    }
    return length;
  }

  /// Khoảng cách Euclidean.
  static double _distance(Point p1, Point p2) {
    double dx = p1.x - p2.x;
    double dy = p1.y - p2.y;
    return math.sqrt(dx * dx + dy * dy);
  }

  /// Bình phương khoảng cách Euclidean (giúp tăng tốc hiệu năng, bỏ qua căn bậc hai).
  static double _distanceSquared(Point p1, Point p2) {
    double dx = p1.x - p2.x;
    double dy = p1.y - p2.y;
    return dx * dx + dy * dy;
  }
}
