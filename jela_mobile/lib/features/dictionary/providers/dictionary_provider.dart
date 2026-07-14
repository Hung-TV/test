import 'package:flutter/material.dart';
import '../models/dictionary_search_item.dart';
import '../services/dictionary_service.dart';

class DictionaryProvider extends ChangeNotifier {
  final DictionaryService _dictionaryService = DictionaryService();

  bool _isLoading = false;
  String? _errorMessage;
  String _currentKeyword = '';
  List<DictionarySearchItem> _results = [];

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  String get currentKeyword => _currentKeyword;
  List<DictionarySearchItem> get results => _results;

  Future<void> search(String keyword) async {
    final trimmedKeyword = keyword.trim();
    if (trimmedKeyword.isEmpty) {
      clearSearch();
      return;
    }

    _isLoading = true;
    _errorMessage = null;
    _currentKeyword = trimmedKeyword;
    notifyListeners();

    try {
      final searchResults = await _dictionaryService.search(trimmedKeyword);
      // Make sure we only update results if this keyword is still the current active search keyword
      if (_currentKeyword == trimmedKeyword) {
        _results = searchResults;
      }
    } catch (e) {
      if (_currentKeyword == trimmedKeyword) {
        _errorMessage = _cleanError(e);
        _results = []; // Clear previous results on error
      }
    } finally {
      if (_currentKeyword == trimmedKeyword) {
        _isLoading = false;
      }
      notifyListeners();
    }
  }

  void clearSearch() {
    _isLoading = false;
    _errorMessage = null;
    _currentKeyword = '';
    _results = [];
    notifyListeners();
  }

  String _cleanError(Object error) {
    return error.toString().replaceFirst('Exception: ', '').trim();
  }
}
