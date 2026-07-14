import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../../features/auth/models/app_user.dart';

class TokenStorage {
  static const String _tokenKey = 'access_token';
  static const String _userKey = 'current_user';

  // Lưu token sau khi login thành công.
  static Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
  }

  // Lấy token đã lưu để tự đăng nhập lại hoặc gắn Authorization header.
  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  // Lưu user dạng JSON để mở app lại vẫn có thông tin profile.
  static Future<void> saveUser(AppUser user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_userKey, jsonEncode(user.toJson()));
  }

  static Future<AppUser?> getUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userJson = prefs.getString(_userKey);

    if (userJson == null || userJson.isEmpty) {
      return null;
    }

    try {
      final decoded = jsonDecode(userJson);
      if (decoded is Map) {
        return AppUser.fromJson(Map<String, dynamic>.from(decoded));
      }
    } catch (_) {
      return null;
    }

    return null;
  }

  // Xóa toàn bộ dữ liệu đăng nhập khi logout hoặc login lỗi.
  static Future<void> clearAll() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_userKey);
  }

  // Giữ hàm cũ để các màn hình khác chưa cập nhật vẫn không bị lỗi.
  static Future<void> clearToken() async {
    await clearAll();
  }
}
