class KanjiLevelOverview {
  final String level;
  final int totalKanji;
  final int learnedKanji;
  final bool isUnlocked;
  final int? listId;

  KanjiLevelOverview({
    required this.level,
    required this.totalKanji,
    required this.learnedKanji,
    required this.isUnlocked,
    this.listId,
  });

  factory KanjiLevelOverview.fromJson(Map<String, dynamic> json) {
    return KanjiLevelOverview(
      level: json['level']?.toString() ?? '',
      totalKanji: _parseInt(json['totalKanji']),
      learnedKanji: _parseInt(json['learnedKanji']),
      isUnlocked: json['isUnlocked'] as bool? ?? false,
      listId: json['listId'] != null ? _parseInt(json['listId']) : null,
    );
  }

  double get progress {
    if (totalKanji == 0) return 0.0;
    return learnedKanji / totalKanji;
  }

  static int _parseInt(dynamic val) {
    if (val is int) return val;
    if (val is num) return val.toInt();
    return int.tryParse(val?.toString() ?? '') ?? 0;
  }
}

class KanjiSummary {
  final int id;
  final String character;
  final String meaning;
  final int strokeCount;
  final String reading;

  KanjiSummary({
    required this.id,
    required this.character,
    required this.meaning,
    required this.strokeCount,
    required this.reading,
  });

  factory KanjiSummary.fromJson(Map<String, dynamic> json) {
    return KanjiSummary(
      id: json['id'] as int? ?? 0,
      character: json['character']?.toString() ?? '',
      meaning: json['meaning']?.toString() ?? '',
      strokeCount: json['strokeCount'] as int? ?? 0,
      reading: json['reading']?.toString() ?? '',
    );
  }
}

class KanjiDetail {
  final int id;
  final String character;
  final String level;
  final List<String> onyomi;
  final List<String> kunyomi;
  final String reading;
  final String meaning;
  final int strokeCount;
  final String? radical;
  final List<KanjiExampleWord> onExamples;
  final List<KanjiExampleWord> kunExamples;

  KanjiDetail({
    required this.id,
    required this.character,
    required this.level,
    required this.onyomi,
    required this.kunyomi,
    required this.reading,
    required this.meaning,
    required this.strokeCount,
    this.radical,
    required this.onExamples,
    required this.kunExamples,
  });

  factory KanjiDetail.fromJson(Map<String, dynamic> json) {
    final onyomiList = json['onyomi'] as List?;
    final kunyomiList = json['kunyomi'] as List?;
    final onEx = json['on'] as List?;
    final kunEx = json['kun'] as List?;

    return KanjiDetail(
      id: json['id'] as int? ?? 0,
      character: json['character']?.toString() ?? '',
      level: json['level']?.toString() ?? '',
      onyomi: onyomiList != null ? onyomiList.map((e) => e.toString()).toList() : [],
      kunyomi: kunyomiList != null ? kunyomiList.map((e) => e.toString()).toList() : [],
      reading: json['reading']?.toString() ?? '',
      meaning: json['meaning']?.toString() ?? '',
      strokeCount: json['strokeCount'] as int? ?? 0,
      radical: json['radical']?.toString(),
      onExamples: onEx != null ? onEx.map((e) => KanjiExampleWord.fromJson(Map<String, dynamic>.from(e as Map))).toList() : [],
      kunExamples: kunEx != null ? kunEx.map((e) => KanjiExampleWord.fromJson(Map<String, dynamic>.from(e as Map))).toList() : [],
    );
  }
}

class KanjiExampleWord {
  final int id;
  final String word;
  final String hiragana;
  final String meaning;

  KanjiExampleWord({
    required this.id,
    required this.word,
    required this.hiragana,
    required this.meaning,
  });

  factory KanjiExampleWord.fromJson(Map<String, dynamic> json) {
    return KanjiExampleWord(
      id: json['id'] as int? ?? 0,
      word: json['word']?.toString() ?? '',
      hiragana: json['hiragana']?.toString() ?? '',
      meaning: json['meaning']?.toString() ?? '',
    );
  }
}

class KanjiHistoryItem {
  final int id;
  final String character;
  final String searchedAt;

  KanjiHistoryItem({
    required this.id,
    required this.character,
    required this.searchedAt,
  });

  factory KanjiHistoryItem.fromJson(Map<String, dynamic> json) {
    return KanjiHistoryItem(
      id: json['id'] as int? ?? 0,
      character: json['character']?.toString() ?? '',
      searchedAt: json['searchedAt']?.toString() ?? '',
    );
  }
}
