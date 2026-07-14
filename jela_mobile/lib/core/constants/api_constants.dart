import 'package:flutter/foundation.dart';

class ApiConstants {
  // Chạy Flutter Web / Chrome.
  static const String localhostBaseUrl = 'http://localhost:8080';

  // Chạy Android Emulator.
  static const String androidEmulatorBaseUrl = 'http://10.0.2.2:8080';

  // Chạy điện thoại thật: đổi IP này theo IPv4 của máy đang chạy backend.
  static const String physicalDeviceBaseUrl = 'http://192.168.1.10:8080';

  // Chọn baseUrl theo môi trường phát triển local:
  // - Chạy trên Chrome Web: tự động dùng localhostBaseUrl
  // - Chạy trên Android Emulator: tự động dùng androidEmulatorBaseUrl
  // - Chạy trên điện thoại thật: đổi sang physicalDeviceBaseUrl bên dưới.
  static const String baseUrl = kIsWeb ? localhostBaseUrl : androidEmulatorBaseUrl;

  // Auth endpoints.
  static const String login = '$baseUrl/api/auth/login';
  static const String register = '$baseUrl/api/auth/register';
  static const String changePassword = '$baseUrl/api/auth/change-password';
  static const String forgotPassword = '$baseUrl/api/auth/forgot-password';
  static const String googleLogin = '$baseUrl/api/auth/google';

  // Backend hiện tại trong repo dùng /api/users/me.
  static const String me = '$baseUrl/api/users/me';
  static const String updateEmail = '$baseUrl/api/users/me/email';
  static const String sendEmailVerification = '$baseUrl/api/users/me/email/verification';

  // Dictionary endpoints.
  static const String dictionarySearch = '$baseUrl/api/dictionary/search';
  static const String dictionaryHistory = '$baseUrl/api/me/dictionary-history';

  static String dictionaryDetail(int id) {
    return '$baseUrl/api/dictionary/$id';
  }

  // Dictionary list endpoints theo UserDictionaryListController.
  static const String dictionaryListAll =
      '$baseUrl/api/me/dictionary-lists/all';
  static const String dictionaryListAddWord =
      '$baseUrl/api/me/dictionary-lists/add-word';
  static const String dictionaryListAddWordToNewList =
      '$baseUrl/api/me/dictionary-lists/add-word-to-new-list';
  static const String dictionaryListCreate =
      '$baseUrl/api/me/dictionary-lists/create';

  static String dictionaryListDetails(int listId) =>
      '$baseUrl/api/me/dictionary-lists/$listId/items';

  static String dictionaryListLearn(int listId) =>
      '$baseUrl/api/me/dictionary-lists/$listId/learn/session';

  static String dictionaryListReview(int listId) =>
      '$baseUrl/api/me/dictionary-lists/$listId/review';

  static String dictionaryListReviewSession(int listId) =>
      '$baseUrl/api/me/dictionary-lists/$listId/review/session';

  static const String dictionaryListExplain =
      '$baseUrl/api/me/dictionary-lists/review/explain';

  // Kanji list endpoints theo KanjiListController.
  static const String kanjiListAll = '$baseUrl/api/me/kanji-list/all';
  static const String kanjiListCreate = '$baseUrl/api/me/kanji-list/create';
  static String kanjiListStartLevel(String level) => '$baseUrl/api/me/kanji-list/levels/$level/start';
  static String kanjiListLearn(int listId) => '$baseUrl/api/me/kanji-list/$listId/learn';
  static String kanjiListReview(int listId) => '$baseUrl/api/me/kanji-list/$listId/review';
  static String kanjiListDetails(int listId) => '$baseUrl/api/me/kanji-list/$listId/items';
  static String kanjiListReviewSession(int listId) => '$baseUrl/api/me/kanji-list/$listId/review/session';
  static const String kanjiListExplain = '$baseUrl/api/me/kanji-list/review/explain';

  // General Kanji endpoints.
  static const String kanjiLevels = '$baseUrl/api/kanji';
  static const String kanjiList = '$baseUrl/api/kanji/list';
  static const String kanjiSearch = '$baseUrl/api/kanji/search';
  static String kanjiDetail(int id) => '$baseUrl/api/kanji/$id';
  static const String kanjiHistory = '$baseUrl/api/me/kanji-history';
  static String kanjiHistoryDelete(int id) => '$baseUrl/api/me/kanji-history/$id';
}

