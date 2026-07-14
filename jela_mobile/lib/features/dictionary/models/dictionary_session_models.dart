import 'dictionary_detail.dart';

class VocabularyLearnItem {
  final int id;
  final String kanji;
  final String hiragana;
  final List<MeaningDetail> meanings;
  final bool isReview;

  VocabularyLearnItem({
    required this.id,
    required this.kanji,
    required this.hiragana,
    required this.meanings,
    required this.isReview,
  });

  factory VocabularyLearnItem.fromJson(Map<String, dynamic> json) {
    var meaningsList = json['meanings'] as List?;
    List<MeaningDetail> parsedMeanings = [];
    if (meaningsList != null) {
      parsedMeanings = meaningsList
          .map((m) => MeaningDetail.fromJson(Map<String, dynamic>.from(m as Map)))
          .toList();
    }
    return VocabularyLearnItem(
      id: json['id'] as int? ?? 0,
      kanji: json['kanji']?.toString() ?? '',
      hiragana: json['hiragana']?.toString() ?? '',
      meanings: parsedMeanings,
      isReview: json['isReview'] as bool? ?? false,
    );
  }
}

class VocabularyQuizQuestion {
  final int dictionaryId;
  final String word;
  final String hiragana;
  final String questionType;
  final String questionText;
  final List<String> options;
  final int correctIndex;
  final String character;

  VocabularyQuizQuestion({
    required this.dictionaryId,
    required this.word,
    required this.hiragana,
    required this.questionType,
    required this.questionText,
    required this.options,
    required this.correctIndex,
    required this.character,
  });

  factory VocabularyQuizQuestion.fromJson(Map<String, dynamic> json) {
    var optionsList = json['options'] as List?;
    return VocabularyQuizQuestion(
      dictionaryId: json['dictionaryId'] as int? ?? 0,
      word: json['word']?.toString() ?? '',
      hiragana: json['hiragana']?.toString() ?? '',
      questionType: json['questionType']?.toString() ?? '',
      questionText: json['questionText']?.toString() ?? '',
      options: optionsList != null ? optionsList.map((o) => o.toString()).toList() : [],
      correctIndex: json['correctIndex'] as int? ?? 0,
      character: json['character']?.toString() ?? '',
    );
  }
}

class VocabularyLearnSessionResponse {
  final String sessionType;
  final int reviewCount;
  final int newCount;
  final List<VocabularyLearnItem> items;
  final List<VocabularyQuizQuestion> questions;

  VocabularyLearnSessionResponse({
    required this.sessionType,
    required this.reviewCount,
    required this.newCount,
    required this.items,
    required this.questions,
  });

  factory VocabularyLearnSessionResponse.fromJson(Map<String, dynamic> json) {
    var itemsList = json['items'] as List?;
    var questionsList = json['questions'] as List?;
    return VocabularyLearnSessionResponse(
      sessionType: json['sessionType']?.toString() ?? '',
      reviewCount: json['reviewCount'] as int? ?? 0,
      newCount: json['newCount'] as int? ?? 0,
      items: itemsList != null ? itemsList.map((i) => VocabularyLearnItem.fromJson(Map<String, dynamic>.from(i as Map))).toList() : [],
      questions: questionsList != null ? questionsList.map((q) => VocabularyQuizQuestion.fromJson(Map<String, dynamic>.from(q as Map))).toList() : [],
    );
  }
}

class VocabularyReviewSessionResponse {
  final List<VocabularyQuizQuestion> questions;

  VocabularyReviewSessionResponse({required this.questions});

  factory VocabularyReviewSessionResponse.fromJson(Map<String, dynamic> json) {
    var questionsList = json['questions'] as List?;
    return VocabularyReviewSessionResponse(
      questions: questionsList != null ? questionsList.map((q) => VocabularyQuizQuestion.fromJson(Map<String, dynamic>.from(q as Map))).toList() : [],
    );
  }
}

class VocabularyReviewResultResponse {
  final String status;
  final List<VocabularyReviewResult> results;

  VocabularyReviewResultResponse({
    required this.status,
    required this.results,
  });

  factory VocabularyReviewResultResponse.fromJson(Map<String, dynamic> json) {
    var resultsList = json['results'] as List?;
    return VocabularyReviewResultResponse(
      status: json['status']?.toString() ?? '',
      results: resultsList != null ? resultsList.map((r) => VocabularyReviewResult.fromJson(Map<String, dynamic>.from(r as Map))).toList() : [],
    );
  }
}

class VocabularyReviewResult {
  final int dictionaryId;
  final String newStatus;
  final String nextReviewAt;
  final int intervalDays;

  VocabularyReviewResult({
    required this.dictionaryId,
    required this.newStatus,
    required this.nextReviewAt,
    required this.intervalDays,
  });

  factory VocabularyReviewResult.fromJson(Map<String, dynamic> json) {
    return VocabularyReviewResult(
      dictionaryId: json['dictionaryId'] as int? ?? 0,
      newStatus: json['newStatus']?.toString() ?? '',
      nextReviewAt: json['nextReviewAt']?.toString() ?? '',
      intervalDays: json['intervalDays'] as int? ?? 0,
    );
  }
}

class DictionaryListDetail {
  final int listId;
  final String listName;
  final List<WordSummary> words;
  final int totalRecords;
  final int totalPages;

  DictionaryListDetail({
    required this.listId,
    required this.listName,
    required this.words,
    required this.totalRecords,
    required this.totalPages,
  });

  factory DictionaryListDetail.fromJson(Map<String, dynamic> json) {
    var wordsList = json['words'] as List?;
    return DictionaryListDetail(
      listId: json['listId'] as int? ?? 0,
      listName: json['listName']?.toString() ?? '',
      words: wordsList != null
          ? wordsList.map((w) => WordSummary.fromJson(Map<String, dynamic>.from(w as Map))).toList()
          : [],
      totalRecords: json['totalRecords'] as int? ?? 0,
      totalPages: json['totalPages'] as int? ?? 1,
    );
  }
}

class WordSummary {
  final int id;
  final String? kanji;
  final String? hiragana;

  WordSummary({
    required this.id,
    this.kanji,
    this.hiragana,
  });

  factory WordSummary.fromJson(Map<String, dynamic> json) {
    return WordSummary(
      id: json['id'] as int? ?? 0,
      kanji: json['kanji']?.toString(),
      hiragana: json['hiragana']?.toString(),
    );
  }

  String get displayWord {
    if (kanji != null && kanji!.trim().isNotEmpty) {
      return kanji!.trim();
    }
    if (hiragana != null && hiragana!.trim().isNotEmpty) {
      return hiragana!.trim();
    }
    return '';
  }

  String get displayReading {
    if (hiragana != null && hiragana!.trim().isNotEmpty) {
      return hiragana!.trim();
    }
    return '';
  }
}
