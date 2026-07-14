import 'package:flutter/material.dart';
import '../models/dictionary_history.dart';
import '../services/dictionary_service.dart';

class DictionaryHistoryProvider extends ChangeNotifier {
  final DictionaryService _dictionaryService = DictionaryService();

  bool _isLoading = false;
  String? _errorMessage;
  List<HistoryWord> _history = [];

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  List<HistoryWord> get history => _history;

  Future<void> loadHistory() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final historyList = await _dictionaryService.getHistory();
      _history = historyList;
    } catch (e) {
      _errorMessage = e.toString().replaceFirst('Exception: ', '').trim();
      _history = [];
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> refresh() async {
    await loadHistory();
  }

  void clear() {
    _isLoading = false;
    _errorMessage = null;
    _history = [];
    notifyListeners();
  }
}
