import 'package:flutter/material.dart';

import '../models/dictionary_session_models.dart';
import '../services/dictionary_list_service.dart';

class DictionarySessionProvider extends ChangeNotifier {
  final DictionaryListService _service = DictionaryListService();

  bool _isLoading = false;
  String? _errorMessage;
  List<VocabularyQuizQuestion> _questions = [];
  int _currentIndex = 0;
  int? _selectedOptionIndex;

  // Track answers: dictionaryId -> list of correct/incorrect values
  final Map<int, List<bool>> _answersLog = {};

  // AI Explanation state
  bool _isExplaining = false;
  String? _explanation;
  String? _explainError;

  // Submit state
  bool _isSubmitting = false;
  bool _isSessionCompleted = false;

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  List<VocabularyQuizQuestion> get questions => _questions;
  int get currentIndex => _currentIndex;
  int? get selectedOptionIndex => _selectedOptionIndex;
  bool get isExplaining => _isExplaining;
  String? get explanation => _explanation;
  String? get explainError => _explainError;
  bool get isSubmitting => _isSubmitting;
  bool get isSessionCompleted => _isSessionCompleted;

  VocabularyQuizQuestion? get currentQuestion =>
      _questions.isNotEmpty && _currentIndex < _questions.length
          ? _questions[_currentIndex]
          : null;

  int get correctAnswersCount {
    int count = 0;
    _answersLog.forEach((id, list) {
      count += list.where((item) => item).length;
    });
    return count;
  }

  int get totalAnswersCount {
    int count = 0;
    _answersLog.forEach((id, list) {
      count += list.length;
    });
    return count;
  }

  int get accuracyRate {
    final total = totalAnswersCount;
    if (total == 0) return 0;
    return ((correctAnswersCount / total) * 100).round();
  }

  void resetSession() {
    _questions = [];
    _currentIndex = 0;
    _selectedOptionIndex = null;
    _answersLog.clear();
    _isExplaining = false;
    _explanation = null;
    _explainError = null;
    _isSubmitting = false;
    _isSessionCompleted = false;
  }

  Future<void> startLearnSession(int listId, {int batchSize = 10}) async {
    resetSession();
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final session = await _service.getLearnSession(
        listId: listId,
        batchSize: batchSize,
      );
      _questions = session.questions;
    } catch (error) {
      _errorMessage = error.toString().replaceFirst('Exception: ', '').trim();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> startReviewSession(int listId, {int batchSize = 10}) async {
    resetSession();
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final session = await _service.getReviewSession(
        listId: listId,
        batchSize: batchSize,
      );
      _questions = session.questions;
    } catch (error) {
      _errorMessage = error.toString().replaceFirst('Exception: ', '').trim();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void selectOption(int index) {
    if (_selectedOptionIndex != null || _isSessionCompleted) return;
    _selectedOptionIndex = index;

    final question = currentQuestion;
    if (question == null) return;

    final isCorrect = index == question.correctIndex;
    _answersLog.putIfAbsent(question.dictionaryId, () => []).add(isCorrect);

    notifyListeners();
  }

  void nextQuestion() {
    _selectedOptionIndex = null;
    _explanation = null;
    _explainError = null;

    if (_currentIndex < _questions.length - 1) {
      _currentIndex++;
    } else {
      _isSessionCompleted = true;
    }
    notifyListeners();
  }

  Future<void> fetchExplanation() async {
    final question = currentQuestion;
    if (question == null || _selectedOptionIndex == null) return;

    _isExplaining = true;
    _explanation = null;
    _explainError = null;
    notifyListeners();

    try {
      final correctWord = question.character.isNotEmpty ? question.character : question.word;
      final selectedWord = question.options[_selectedOptionIndex!];
      _explanation = await _service.explainReviewAnswer(
        correctWord: correctWord,
        selectedWord: selectedWord,
        questionType: question.questionType,
      );
    } catch (error) {
      _explainError = error.toString().replaceFirst('Exception: ', '').trim();
    } finally {
      _isExplaining = false;
      notifyListeners();
    }
  }

  List<Map<String, dynamic>> calculateQualityReviews() {
    final List<Map<String, dynamic>> reviews = [];
    _answersLog.forEach((dictionaryId, list) {
      final total = list.length;
      final correct = list.where((item) => item).length;
      final wrong = total - correct;

      int quality = 3; // Good
      if (wrong == 1) {
        quality = 2; // Hard
      } else if (wrong >= 2) {
        quality = 1; // Again
      }

      reviews.add({
        'dictionaryId': dictionaryId,
        'quality': quality,
        'correctCount': correct,
        'totalCount': total,
        'word': _findWordCharacter(dictionaryId),
      });
    });
    return reviews;
  }

  String _findWordCharacter(int dictionaryId) {
    try {
      final match = _questions.firstWhere((q) => q.dictionaryId == dictionaryId);
      return match.word.isNotEmpty ? match.word : match.character;
    } catch (_) {
      return '';
    }
  }

  Future<bool> submitReviews(int listId) async {
    _isSubmitting = true;
    notifyListeners();

    try {
      final reviews = calculateQualityReviews().map((r) => {
        'dictionaryId': r['dictionaryId'],
        'quality': r['quality'],
      }).toList();

      await _service.submitReview(listId: listId, reviews: reviews);
      _isSubmitting = false;
      notifyListeners();
      return true;
    } catch (error) {
      _errorMessage = error.toString().replaceFirst('Exception: ', '').trim();
      _isSubmitting = false;
      notifyListeners();
      return false;
    }
  }
}
