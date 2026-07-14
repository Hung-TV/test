class DictionaryDetail {
  final int id;
  final String? kanji;
  final String? hiragana;
  final List<MeaningDetail> meanings;

  DictionaryDetail({
    required this.id,
    this.kanji,
    this.hiragana,
    required this.meanings,
  });

  factory DictionaryDetail.fromJson(Map<String, dynamic> json) {
    var meaningList = json['meaning'] as List?;
    List<MeaningDetail> parsedMeanings = [];
    if (meaningList != null) {
      parsedMeanings = meaningList
          .map((m) => MeaningDetail.fromJson(Map<String, dynamic>.from(m as Map)))
          .toList();
    }

    return DictionaryDetail(
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

  bool get hasMeanings => meanings.isNotEmpty;
}

class MeaningDetail {
  final int meaningId;
  final String? pos;
  final String? gloss;
  final String? xref;
  final List<ExampleSentence> examples;

  MeaningDetail({
    required this.meaningId,
    this.pos,
    this.gloss,
    this.xref,
    required this.examples,
  });

  factory MeaningDetail.fromJson(Map<String, dynamic> json) {
    var exampleList = json['example'] as List?;
    List<ExampleSentence> parsedExamples = [];
    if (exampleList != null) {
      parsedExamples = exampleList
          .map((e) => ExampleSentence.fromJson(Map<String, dynamic>.from(e as Map)))
          .toList();
    }

    return MeaningDetail(
      meaningId: json['meaningId'] as int? ?? 0,
      pos: json['pos'] as String?,
      gloss: json['gloss'] as String?,
      xref: json['xref'] as String?,
      examples: parsedExamples,
    );
  }

  String get displayPos => pos ?? '';
  String get displayGloss => gloss ?? 'Chưa có nghĩa';
  String get displayXref => xref ?? '';
}

class ExampleSentence {
  final int exId;
  final String? exTest;
  final String? sentenceJP;
  final String? sentenceVI;

  ExampleSentence({
    required this.exId,
    this.exTest,
    this.sentenceJP,
    this.sentenceVI,
  });

  factory ExampleSentence.fromJson(Map<String, dynamic> json) {
    return ExampleSentence(
      exId: json['exId'] as int? ?? 0,
      exTest: json['exTest'] as String?,
      sentenceJP: json['sentenceJP'] as String?,
      sentenceVI: json['sentenceVI'] as String?,
    );
  }

  String get displaySentenceJP => sentenceJP ?? '';
  String get displaySentenceVI => sentenceVI ?? '';
}
