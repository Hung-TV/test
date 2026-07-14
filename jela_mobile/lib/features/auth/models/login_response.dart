import 'app_user.dart';

class LoginResponse {
  final String token;
  final AppUser? user;

  LoginResponse({required this.token, this.user});

  factory LoginResponse.fromJson(Map<String, dynamic> json) {
    // Nhận token từ các key phổ biến của backend.
    final token =
        (json['token'] ??
                json['accessToken'] ??
                json['access_token'] ??
                json['jwt'] ??
                '')
            .toString();

    // User có thể nằm trong nhiều key khác nhau; nếu không có thì AuthProvider sẽ gọi /me.
    final userData = json['user'] ?? json['data'] ?? json['profile'];

    return LoginResponse(
      token: token,
      user: userData is Map
          ? AppUser.fromJson(Map<String, dynamic>.from(userData))
          : null,
    );
  }
}
