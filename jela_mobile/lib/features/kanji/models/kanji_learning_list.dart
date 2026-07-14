class KanjiLearningList {
  final int listId;
  final String listName;
  final String? sourceType;
  final int totalCount;
  final int dueCount;
  final int masteredCount;
  final int newCount;
  final int learningCount;
  final bool completed;
  final String? updatedAt;

  KanjiLearningList({
    required this.listId,
    required this.listName,
    this.sourceType,
    required this.totalCount,
    required this.dueCount,
    required this.masteredCount,
    required this.newCount,
    required this.learningCount,
    required this.completed,
    this.updatedAt,
  });

  factory KanjiLearningList.fromJson(Map<String, dynamic> json) {
    return KanjiLearningList(
      listId: _parseInt(json['listId']),
      listName: json['listName']?.toString() ?? 'Chưa đặt tên',
      sourceType: json['sourceType']?.toString(),
      totalCount: _parseInt(json['totalCount']),
      dueCount: _parseInt(json['dueCount']),
      masteredCount: _parseInt(json['masteredCount']),
      newCount: _parseInt(json['newCount']),
      learningCount: _parseInt(json['learningCount']),
      completed: json['completed'] as bool? ?? false,
      updatedAt: json['updatedAt']?.toString(),
    );
  }

  String get displayKanjiCount => '$totalCount chữ';

  static int _parseInt(dynamic value) {
    if (value is int) {
      return value;
    }
    if (value is num) {
      return value.toInt();
    }
    return int.tryParse(value?.toString() ?? '') ?? 0;
  }
}
