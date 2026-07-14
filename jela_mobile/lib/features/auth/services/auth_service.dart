import '../../../core/constants/api_constants.dart';
import '../../../core/network/api_client.dart';
import '../models/app_user.dart';
import '../models/login_response.dart';

class AuthService {
  final ApiClient _apiClient = ApiClient();

  Future<LoginResponse> login({
    required String email,
    required String password,
  }) async {
    final data = await _apiClient.post(
      ApiConstants.login,
      requireAuth: false,
      body: {
        // Nếu backend đổi sang username, sửa key email thành username tại đây.
        'email': email,
        'password': password,
      },
    );

    final response = LoginResponse.fromJson(
      Map<String, dynamic>.from(data as Map),
    );
    if (response.token.trim().isEmpty) {
      throw Exception('Backend không trả về token');
    }

    return response;
  }

  Future<void> register({
    required String email,
    required String password,
    required String fullName,
    required String level,
  }) async {
    await _apiClient.post(
      ApiConstants.register,
      requireAuth: false,
      body: {
        'email': email,
        'password': password,
        'fullName': fullName,
        'level': level,
      },
    );
  }

  Future<AppUser> getMe() async {
    final data = await _apiClient.get(ApiConstants.me, requireAuth: true);
    final userData = data is Map && data['data'] is Map ? data['data'] : data;

    return AppUser.fromJson(Map<String, dynamic>.from(userData as Map));
  }

  /// Cập nhật thông tin cá nhân lên server thông qua method PATCH
  Future<AppUser> updateProfile({
    required String fullName,
    required String phone,
    required String level,
    String? avatarUrl,
  }) async {
    final data = await _apiClient.patch(
      ApiConstants.me,
      requireAuth: true,
      body: {
        'fullName': fullName,
        'phone': phone,
        'level': level,
        'avatarUrl':? avatarUrl,
      },
    );
    final userData = data is Map && data['data'] is Map ? data['data'] : data;

    return AppUser.fromJson(Map<String, dynamic>.from(userData as Map));
  }

  /// Đổi mật khẩu tài khoản (PATCH /api/auth/change-password)
  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
    required String confirmPassword,
  }) async {
    await _apiClient.patch(
      ApiConstants.changePassword,
      requireAuth: true,
      body: {
        'currentPassword': currentPassword,
        'newPassword': newPassword,
        'confirmPassword': confirmPassword,
      },
    );
  }

  /// Gửi yêu cầu quên mật khẩu (POST /api/auth/forgot-password)
  Future<void> forgotPassword(String email) async {
    await _apiClient.post(
      ApiConstants.forgotPassword,
      requireAuth: false, // Quên mật khẩu không cần auth token
      body: {'email': email},
    );
  }

  /// Cập nhật địa chỉ email mới (PATCH /api/users/me/email)
  Future<AppUser> updateEmail(String email) async {
    final data = await _apiClient.patch(
      ApiConstants.updateEmail,
      requireAuth: true,
      body: {'email': email},
    );
    final userData = data is Map && data['data'] is Map ? data['data'] : data;
    return AppUser.fromJson(Map<String, dynamic>.from(userData as Map));
  }

  /// Gửi email xác thực tài khoản (POST /api/users/me/email/verification)
  Future<void> sendEmailVerification() async {
    await _apiClient.post(
      ApiConstants.sendEmailVerification,
      requireAuth: true,
    );
  }

  /// Đăng nhập bằng tài khoản Google (POST /api/auth/google)
  Future<LoginResponse> googleLogin(String idToken) async {
    final data = await _apiClient.post(
      ApiConstants.googleLogin,
      requireAuth: false,
      body: {
        'idToken': idToken,
      },
    );

    final response = LoginResponse.fromJson(
      Map<String, dynamic>.from(data as Map),
    );
    if (response.token.trim().isEmpty) {
      throw Exception('Backend không trả về token');
    }

    return response;
  }
}
