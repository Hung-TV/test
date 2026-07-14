class DictionaryWordList {
  final int id;
  final String name;
  final int wordCount;
  final int dueCount;
  final int masteredCount;
  final int newCount;
  final int learningCount;
  final bool completed;
  final String? updatedAt;

  DictionaryWordList({
    required this.id,
    required this.name,
    required this.wordCount,
    required this.dueCount,
    required this.masteredCount,
    required this.newCount,
    required this.learningCount,
    required this.completed,
    this.updatedAt,
  });

  factory DictionaryWordList.fromJson(Map<String, dynamic> json) {
    return DictionaryWordList(
      id: _parseInt(json['id']),
      name: _parseText(json['name'], fallback: 'Chưa đặt tên'),
      wordCount: _parseInt(json['wordCount']),
      dueCount: _parseInt(json['dueCount']),
      masteredCount: _parseInt(json['masteredCount']),
      newCount: _parseInt(json['newCount']),
      learningCount: _parseInt(json['learningCount']),
      completed: json['completed'] as bool? ?? false,
      updatedAt: json['updatedAt']?.toString(),
    );
  }

  String get displayWordCount => '$wordCount từ';


  static int _parseInt(dynamic value) {
    if (value is int) {
      return value;
    }
    if (value is num) {
      return value.toInt();
    }
    return int.tryParse(value?.toString() ?? '') ?? 0;
  }

  static String _parseText(dynamic value, {required String fallback}) {
    final text = value?.toString().trim() ?? '';
    return text.isEmpty ? fallback : text;
  }
}
