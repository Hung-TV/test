import 'package:flutter/material.dart';

import '../models/dictionary_session_models.dart';
import '../services/dictionary_list_service.dart';

class DictionaryListDetailProvider extends ChangeNotifier {
  final DictionaryListService _service = DictionaryListService();

  bool _isLoading = false;
  String? _errorMessage;
  DictionaryListDetail? _detail;
  int _currentPage = 1;
  static const int _pageSize = 10;

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  DictionaryListDetail? get detail => _detail;
  int get currentPage => _currentPage;

  Future<void> loadDetails(int listId, {bool resetPage = false}) async {
    if (resetPage) {
      _currentPage = 1;
    }

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final responseMap = await _service.getListDetails(
        listId: listId,
        page: _currentPage,
        size: _pageSize,
      );
      _detail = DictionaryListDetail.fromJson(responseMap);
    } catch (error) {
      _errorMessage = error.toString().replaceFirst('Exception: ', '').trim();
      _detail = null;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> nextPage(int listId) async {
    final totalPages = _detail?.totalPages ?? 1;
    if (_currentPage < totalPages) {
      _currentPage++;
      await loadDetails(listId);
    }
  }

  Future<void> prevPage(int listId) async {
    if (_currentPage > 1) {
      _currentPage--;
      await loadDetails(listId);
    }
  }

  Future<void> refresh(int listId) async {
    await loadDetails(listId, resetPage: true);
  }
}
