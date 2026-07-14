class DictionaryHistory {
  final List<HistoryWord> history;

  DictionaryHistory({required this.history});

  factory DictionaryHistory.fromJson(Map<String, dynamic> json) {
    final list = json['hisWordList'] as List?;
    final parsed = list
            ?.map((item) => HistoryWord.fromJson(Map<String, dynamic>.from(item as Map)))
            .toList() ??
        [];
    return DictionaryHistory(history: parsed);
  }
}

class HistoryWord {
  final int id;
  final String kanji;
  final DateTime searchedAt;

  HistoryWord({
    required this.id,
    required this.kanji,
    required this.searchedAt,
  });

  factory HistoryWord.fromJson(Map<String, dynamic> json) {
    DateTime parsedDate;
    if (json['searchedAt'] != null) {
      parsedDate = DateTime.tryParse(json['searchedAt'] as String) ?? DateTime.now();
    } else {
      parsedDate = DateTime.now();
    }

    return HistoryWord(
      id: json['id'] as int? ?? 0,
      kanji: json['kanji'] as String? ?? '',
      searchedAt: parsedDate,
    );
  }

  String get displayTime {
    final day = searchedAt.day.toString().padLeft(2, '0');
    final month = searchedAt.month.toString().padLeft(2, '0');
    final year = searchedAt.year;
    final hour = searchedAt.hour.toString().padLeft(2, '0');
    final minute = searchedAt.minute.toString().padLeft(2, '0');
    return '$day/$month/$year $hour:$minute';
  }
}
