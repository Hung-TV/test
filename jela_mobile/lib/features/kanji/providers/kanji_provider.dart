import 'package:flutter/material.dart';

import '../models/kanji_models.dart';
import '../services/kanji_service.dart';

class KanjiProvider extends ChangeNotifier {
  final KanjiService _service = KanjiService();

  // Levels state
  bool _isLoadingLevels = false;
  List<KanjiLevelOverview> _levels = [];
  String? _levelsError;

  bool get isLoadingLevels => _isLoadingLevels;
  List<KanjiLevelOverview> get levels => _levels;
  String? get levelsError => _levelsError;

  // Paginated Level Kanji list state
  bool _isLoadingKanjis = false;
  List<KanjiSummary> _kanjis = [];
  int _totalPages = 1;
  int _totalElements = 0;
  int _currentPage = 1;
  String? _selectedLevel;
  String? _kanjisError;

  bool get isLoadingKanjis => _isLoadingKanjis;
  List<KanjiSummary> get kanjis => _kanjis;
  int get totalPages => _totalPages;
  int get totalElements => _totalElements;
  int get currentPage => _currentPage;
  String? get selectedLevel => _selectedLevel;
  String? get kanjisError => _kanjisError;

  // Search state
  bool _isLoadingSearch = false;
  List<KanjiSummary> _searchResults = [];
  String? _searchError;

  bool get isLoadingSearch => _isLoadingSearch;
  List<KanjiSummary> get searchResults => _searchResults;
  String? get searchError => _searchError;

  // History state
  bool _isLoadingHistory = false;
  List<KanjiHistoryItem> _history = [];
  String? _historyError;

  bool get isLoadingHistory => _isLoadingHistory;
  List<KanjiHistoryItem> get history => _history;
  String? get historyError => _historyError;

  // Details loading state
  final Map<int, KanjiDetail> _detailsCache = {};
  bool _isLoadingDetail = false;
  String? _detailError;

  bool get isLoadingDetail => _isLoadingDetail;
  String? get detailError => _detailError;

  KanjiDetail? getCachedDetail(int id) => _detailsCache[id];

  Future<void> loadLevels() async {
    _isLoadingLevels = true;
    _levelsError = null;
    notifyListeners();

    try {
      _levels = await _service.getLevels();
    } catch (e) {
      _levelsError = _cleanError(e);
    } finally {
      _isLoadingLevels = false;
      notifyListeners();
    }
  }

  Future<void> selectLevel(String level) async {
    _selectedLevel = level;
    _currentPage = 1;
    await loadKanjiByLevel(level, page: 1);
  }

  Future<void> loadKanjiByLevel(String level, {int page = 1}) async {
    _isLoadingKanjis = true;
    _kanjisError = null;
    _currentPage = page;
    notifyListeners();

    try {
      final res = await _service.getKanjiByLevel(level: level, page: page);
      _kanjis = res['kanjis'] as List<KanjiSummary>;
      _totalPages = res['totalPages'] as int;
      _totalElements = res['totalElements'] as int;
    } catch (e) {
      _kanjisError = _cleanError(e);
      _kanjis = [];
    } finally {
      _isLoadingKanjis = false;
      notifyListeners();
    }
  }

  Future<void> search(String searchKey) async {
    if (searchKey.trim().isEmpty) {
      _searchResults = [];
      notifyListeners();
      return;
    }

    _isLoadingSearch = true;
    _searchError = null;
    notifyListeners();

    try {
      _searchResults = await _service.search(searchKey);
    } catch (e) {
      _searchError = _cleanError(e);
      _searchResults = [];
    } finally {
      _isLoadingSearch = false;
      notifyListeners();
    }
  }

  Future<KanjiDetail?> loadDetail(int id) async {
    _isLoadingDetail = true;
    _detailError = null;
    notifyListeners();

    try {
      final detail = await _service.getDetail(id);
      _detailsCache[id] = detail;
      // Refresh history because viewing detail updates search history
      loadHistory();
      return detail;
    } catch (e) {
      _detailError = _cleanError(e);
      return null;
    } finally {
      _isLoadingDetail = false;
      notifyListeners();
    }
  }

  Future<void> loadHistory({int page = 1}) async {
    _isLoadingHistory = true;
    _historyError = null;
    notifyListeners();

    try {
      final res = await _service.getHistory(page: page);
      _history = res['history'] as List<KanjiHistoryItem>;
    } catch (e) {
      _historyError = _cleanError(e);
    } finally {
      _isLoadingHistory = false;
      notifyListeners();
    }
  }

  Future<void> deleteHistory(int id) async {
    try {
      await _service.deleteHistory(id);
      _history.removeWhere((item) => item.id == id);
      notifyListeners();
    } catch (e) {
      // Ignore or log error
    }
  }

  void clearSearch() {
    _searchResults = [];
    _searchError = null;
    notifyListeners();
  }

  String _cleanError(Object error) {
    return error.toString().replaceFirst('Exception: ', '').trim();
  }
}
