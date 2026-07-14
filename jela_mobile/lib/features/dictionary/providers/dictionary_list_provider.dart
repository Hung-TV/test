import 'package:flutter/material.dart';

import '../models/dictionary_word_list.dart';
import '../services/dictionary_list_service.dart';

class DictionaryListProvider extends ChangeNotifier {
  final DictionaryListService _service = DictionaryListService();

  bool _isLoading = false;
  String? _errorMessage;
  List<DictionaryWordList> _lists = [];

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  List<DictionaryWordList> get lists => _lists;

  Future<void> loadLists() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _lists = await _service.getLists();
    } catch (error) {
      _errorMessage = _cleanError(error);
      _lists = [];
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> addWordToList({required int listId, required int wordId}) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _service.addWordToList(listId: listId, wordId: wordId);
      await loadLists();
      return true;
    } catch (error) {
      _errorMessage = _cleanError(error);
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> addWordToNewList({
    required String listName,
    required int wordId,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _service.addWordToNewList(listName: listName, wordId: wordId);
      await loadLists();
      return true;
    } catch (error) {
      _errorMessage = _cleanError(error);
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> createList(String name) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _service.createList(name);
      await loadLists();
      return true;
    } catch (error) {
      _errorMessage = _cleanError(error);
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> refresh() async {
    await loadLists();
  }

  String _cleanError(Object error) {
    return error.toString().replaceFirst('Exception: ', '').trim();
  }
}
