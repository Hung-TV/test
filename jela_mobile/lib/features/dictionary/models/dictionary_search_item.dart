class DictionarySearchItem {
  final int id;
  final String? kanji;
  final String? hiragana;
  final List<MeaningSummary> meanings;

  DictionarySearchItem({
    required this.id,
    this.kanji,
    this.hiragana,
    required this.meanings,
  });

  factory DictionarySearchItem.fromJson(Map<String, dynamic> json) {
    var meaningList = json['meaning'] as List?;
    List<MeaningSummary> parsedMeanings = [];
    if (meaningList != null) {
      parsedMeanings = meaningList
          .map((m) => MeaningSummary.fromJson(Map<String, dynamic>.from(m as Map)))
          .toList();
    }

    return DictionarySearchItem(
      id: json['id'] as int? ?? 0,
      kanji: json['kanji'] as String?,
      hiragana: json['hiragana'] as String?,
      meanings: parsedMeanings,
    );
  }

  String get displayWord {
    if (kanji != null && kanji!.trim().isNotEmpty) {
      return kanji!.trim();
    }
    if (hiragana != null && hiragana!.trim().isNotEmpty) {
      return hiragana!.trim();
    }
    return 'Không rõ từ';
  }

  String get displayReading {
    if (hiragana != null && hiragana!.trim().isNotEmpty) {
      return hiragana!.trim();
    }
    return 'Chưa có cách đọc';
  }

  String get displayMeaning {
    if (meanings.isEmpty) {
      return 'Chưa có nghĩa';
    }
    final glosses = meanings
        .map((m) => m.gloss.trim())
        .where((g) => g.isNotEmpty)
        .toList();
    if (glosses.isEmpty) {
      return 'Chưa có nghĩa';
    }
    return glosses.join('; ');
  }
}

class MeaningSummary {
  final int meaningId;
  final String gloss;

  MeaningSummary({
    required this.meaningId,
    required this.gloss,
  });

  factory MeaningSummary.fromJson(Map<String, dynamic> json) {
    return MeaningSummary(
      meaningId: json['meaningId'] as int? ?? 0,
      gloss: json['gloss'] as String? ?? '',
    );
  }
}
