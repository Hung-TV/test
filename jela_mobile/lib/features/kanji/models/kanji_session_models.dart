class KanjiQuizQuestion {
  final int kanjiId;
  final String character;
  final String questionType;
  final String questionText;
  final List<String> options;
  final int correctIndex;

  KanjiQuizQuestion({
    required this.kanjiId,
    required this.character,
    required this.questionType,
    required this.questionText,
    required this.options,
    required this.correctIndex,
  });

  factory KanjiQuizQuestion.fromJson(Map<String, dynamic> json) {
    var optionsList = json['options'] as List?;
    return KanjiQuizQuestion(
      kanjiId: json['kanjiId'] as int? ?? 0,
      character: json['character']?.toString() ?? '',
      questionType: json['questionType']?.toString() ?? '',
      questionText: json['questionText']?.toString() ?? '',
      options: optionsList != null ? optionsList.map((o) => o.toString()).toList() : [],
      correctIndex: json['correctIndex'] as int? ?? 0,
    );
  }
}

class KanjiLearnSessionResponse {
  final String sessionType;
  final int reviewCount;
  final int newCount;
  final List<KanjiQuizQuestion> questions;

  KanjiLearnSessionResponse({
    required this.sessionType,
    required this.reviewCount,
    required this.newCount,
    required this.questions,
  });

  factory KanjiLearnSessionResponse.fromJson(Map<String, dynamic> json) {
    var questionsList = json['questions'] as List?;
    return KanjiLearnSessionResponse(
      sessionType: json['sessionType']?.toString() ?? '',
      reviewCount: json['reviewCount'] as int? ?? 0,
      newCount: json['newCount'] as int? ?? 0,
      questions: questionsList != null ? questionsList.map((q) => KanjiQuizQuestion.fromJson(Map<String, dynamic>.from(q as Map))).toList() : [],
    );
  }
}
