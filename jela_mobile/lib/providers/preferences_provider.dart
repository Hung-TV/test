import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Quản lý cấu hình tùy chọn của người dùng toàn app
/// Hỗ trợ Dark Mode, Chuyển đổi Ngôn ngữ (vi/en) và Bật/tắt thông báo
class PreferencesProvider extends ChangeNotifier {
  ThemeMode _themeMode = ThemeMode.light;
  Locale _locale = const Locale('vi');
  bool _emailNotifications = true;
  bool _streakReminders = true;

  ThemeMode get themeMode => _themeMode;
  Locale get locale => _locale;
  bool get emailNotifications => _emailNotifications;
  bool get streakReminders => _streakReminders;

  bool get isDarkMode => _themeMode == ThemeMode.dark;

  PreferencesProvider() {
    _loadPreferences();
  }

  /// Tải các cài đặt đã lưu từ SharedPreferences
  Future<void> _loadPreferences() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      
      // Tải giao diện tối/sáng
      final isDark = prefs.getBool('theme_is_dark') ?? false;
      _themeMode = isDark ? ThemeMode.dark : ThemeMode.light;

      // Tải ngôn ngữ hiển thị
      final langCode = prefs.getString('language_code') ?? 'vi';
      _locale = Locale(langCode);

      // Tải cấu hình thông báo
      _emailNotifications = prefs.getBool('notif_email') ?? true;
      _streakReminders = prefs.getBool('notif_streak') ?? true;

      notifyListeners();
    } catch (e) {
      debugPrint('Lỗi tải cấu hình tùy chọn: $e');
    }
  }

  /// Bật / Tắt Dark Mode
  Future<void> toggleTheme(bool isDark) async {
    _themeMode = isDark ? ThemeMode.dark : ThemeMode.light;
    notifyListeners();
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('theme_is_dark', isDark);
    } catch (e) {
      debugPrint('Lỗi lưu cấu hình theme: $e');
    }
  }

  /// Thay đổi ngôn ngữ toàn hệ thống
  Future<void> setLanguage(String langCode) async {
    _locale = Locale(langCode);
    notifyListeners();
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('language_code', langCode);
    } catch (e) {
      debugPrint('Lỗi lưu cấu hình ngôn ngữ: $e');
    }
  }

  /// Bật / Tắt email thông báo
  Future<void> setEmailNotifications(bool enabled) async {
    _emailNotifications = enabled;
    notifyListeners();
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('notif_email', enabled);
    } catch (e) {
      debugPrint('Lỗi lưu cấu hình thông báo email: $e');
    }
  }

  /// Bật / Tắt nhắc nhở học tập (Streak)
  Future<void> setStreakReminders(bool enabled) async {
    _streakReminders = enabled;
    notifyListeners();
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('notif_streak', enabled);
    } catch (e) {
      debugPrint('Lỗi lưu cấu hình nhắc nhở học tập: $e');
    }
  }
}
