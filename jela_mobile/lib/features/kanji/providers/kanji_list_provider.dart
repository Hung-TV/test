import 'package:flutter/material.dart';

import '../models/kanji_learning_list.dart';
import '../services/kanji_list_service.dart';

class KanjiListProvider extends ChangeNotifier {
  final KanjiListService _service = KanjiListService();

  bool _isLoading = false;
  String? _errorMessage;
  List<KanjiLearningList> _lists = [];

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  List<KanjiLearningList> get lists => _lists;

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

  Future<bool> startLevelList(String level) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _service.startLevelList(level);
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

  Future<bool> addKanjiToList(int listId, int kanjiId) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _service.addKanjiToList(listId, kanjiId);
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (error) {
      _errorMessage = _cleanError(error);
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  String _cleanError(Object error) {
    return error.toString().replaceFirst('Exception: ', '').trim();
  }
}
