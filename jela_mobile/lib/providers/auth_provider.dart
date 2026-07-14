import 'package:flutter/material.dart';

import '../core/network/api_client.dart';
import '../core/storage/token_storage.dart';
import '../core/navigation/navigator_key.dart';
import '../features/auth/models/app_user.dart';
import '../features/auth/services/auth_service.dart';

class AuthProvider extends ChangeNotifier {
  final AuthService _authService = AuthService();

  AuthProvider() {
    // Tự động đăng xuất khi nhận diện token bị hết hạn / không hợp lệ (401 hoặc 403) từ ApiClient
    ApiClient.onUnauthorized = () {
      logout(isUnauthorized: true);
    };
  }

  bool _isLoggedIn = false;
  bool _isLoading = false;
  bool _isCheckingLoginStatus = true;
  String? _errorMessage;
  String? _token;
  AppUser? _user;

  bool get isLoggedIn => _isLoggedIn;
  bool get isLoading => _isLoading;
  bool get isCheckingLoginStatus => _isCheckingLoginStatus;
  String? get errorMessage => _errorMessage;
  String? get token => _token;
  AppUser? get user => _user;

  String? get fullName => _user?.fullName;
  String? get email => _user?.email;
  String? get avatarUrl => _user?.avatarUrl;
  String? get phone => _user?.phone;
  String? get level => _user?.level;
  bool get emailVerified => _user?.emailVerified ?? false;
  String? get status => _user?.status;
  String? get authType => _user?.authType;
  List<String> get roles => _user?.roles ?? [];
  bool get isAdmin => roles.contains('ADMIN');

  Future<void> checkLoginStatus() async {
    _isCheckingLoginStatus = true;
    notifyListeners();

    final savedToken = await TokenStorage.getToken();
    final savedUser = await TokenStorage.getUser();

    if (savedToken == null || savedToken.isEmpty || savedUser == null) {
      _setLoggedOut();
      _isCheckingLoginStatus = false;
      notifyListeners();
      return;
    }

    _token = savedToken;
    _user = savedUser;
    _isLoggedIn = true;
    _errorMessage = null;
    _isCheckingLoginStatus = false;
    notifyListeners();

    await refreshCurrentUser(silent: true);
  }

  Future<bool> login({required String email, required String password}) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final loginResponse = await _authService.login(
        email: email,
        password: password,
      );
      await TokenStorage.saveToken(loginResponse.token);

      // Backend login hiện trả user rút gọn, nên luôn gọi /me để lấy UserMeResponse đầy đủ.
      final currentUser = await _authService.getMe();
      await TokenStorage.saveUser(currentUser);

      _token = loginResponse.token;
      _user = currentUser;
      _isLoggedIn = true;
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (error) {
      await TokenStorage.clearAll();
      _setLoggedOut();
      _errorMessage = _cleanError(error);
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> register({
    required String email,
    required String password,
    required String fullName,
    required String level,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _authService.register(
        email: email,
        password: password,
        fullName: fullName,
        level: level,
      );

      _isLoading = false;
      notifyListeners();
      return true;
    } catch (error) {
      await TokenStorage.clearAll();
      _setLoggedOut();
      _errorMessage = _cleanError(error);
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> refreshCurrentUser({bool silent = false}) async {
    if (!silent) {
      _isLoading = true;
      _errorMessage = null;
      notifyListeners();
    }

    try {
      final currentUser = await _authService.getMe();
      _user = currentUser;
      await TokenStorage.saveUser(currentUser);
    } catch (error) {
      if (!silent) {
        _errorMessage = _cleanError(error);
      }
    } finally {
      if (!silent) {
        _isLoading = false;
      }
      notifyListeners();
    }
  }

  /// Cập nhật thông tin cá nhân lên server và đồng bộ cục bộ
  Future<bool> updateProfile({
    required String fullName,
    required String phone,
    required String level,
    String? avatarUrl,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final updatedUser = await _authService.updateProfile(
        fullName: fullName,
        phone: phone,
        level: level,
        avatarUrl: avatarUrl,
      );
      _user = updatedUser;
      await TokenStorage.saveUser(updatedUser);
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

  /// Đổi mật khẩu tài khoản
  Future<bool> changePassword({
    required String currentPassword,
    required String newPassword,
    required String confirmPassword,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _authService.changePassword(
        currentPassword: currentPassword,
        newPassword: newPassword,
        confirmPassword: confirmPassword,
      );
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

  /// Gửi yêu cầu quên mật khẩu
  Future<bool> forgotPassword(String email) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _authService.forgotPassword(email);
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

  /// Cập nhật địa chỉ email mới
  Future<bool> updateEmail(String newEmail) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final updatedUser = await _authService.updateEmail(newEmail);
      _user = updatedUser;
      await TokenStorage.saveUser(updatedUser);
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

  /// Gửi email xác minh tài khoản
  Future<bool> sendEmailVerification() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _authService.sendEmailVerification();
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

  /// Đăng nhập bằng tài khoản Google
  Future<bool> loginWithGoogle(String idToken) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final loginResponse = await _authService.googleLogin(idToken);
      await TokenStorage.saveToken(loginResponse.token);

      final currentUser = await _authService.getMe();
      await TokenStorage.saveUser(currentUser);

      _token = loginResponse.token;
      _user = currentUser;
      _isLoggedIn = true;
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (error) {
      await TokenStorage.clearAll();
      _setLoggedOut();
      _errorMessage = _cleanError(error);
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout({bool isUnauthorized = false}) async {
    await TokenStorage.clearAll();
    _setLoggedOut();
    notifyListeners();
    
    // Đẩy user về màn hình Login bằng cách xóa toàn bộ stack navigation hiện tại
    navigatorKey.currentState?.popUntil((route) => route.isFirst);

    // Hiển thị thông báo nếu bị văng do hết hạn token
    if (isUnauthorized && navigatorKey.currentContext != null) {
      ScaffoldMessenger.of(navigatorKey.currentContext!).showSnackBar(
        const SnackBar(
          content: Text('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _setLoggedOut() {
    _isLoggedIn = false;
    _token = null;
    _user = null;
    _errorMessage = null;
  }

  String _cleanError(Object error) {
    return error.toString().replaceFirst('Exception: ', '').trim();
  }
}
