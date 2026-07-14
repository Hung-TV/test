class AppUser {
  final int? userId;
  final String email;
  final String fullName;
  final String? avatarUrl;
  final String? phone;
  final String? level;
  final bool emailVerified;
  final String? status;
  final String? authType;
  final List<String> roles;
  final int streakCount;
  final String? lastStudiedAt;

  AppUser({
    this.userId,
    required this.email,
    required this.fullName,
    this.avatarUrl,
    this.phone,
    this.level,
    this.emailVerified = false,
    this.status,
    this.authType,
    this.roles = const [],
    this.streakCount = 0,
    this.lastStudiedAt,
  });

  factory AppUser.fromJson(Map<String, dynamic> json) {
    // Xử lý userId hoặc id từ backend, không để app crash nếu kiểu dữ liệu đổi.
    final id = _parseInt(json['userId'] ?? json['id']);

    // Fallback cho fullName từ fullName hoặc name.
    final name = _parseString(json['fullName'] ?? json['name']);

    return AppUser(
      userId: id,
      email: _parseString(json['email']),
      fullName: name.isEmpty ? 'Người dùng' : name,
      avatarUrl: _parseNullableString(json['avatarUrl']),
      phone: _parseNullableString(json['phone']),
      level: _parseNullableString(json['level']),
      emailVerified: json['emailVerified'] == true,
      status: _parseNullableString(json['status']),
      authType: _parseNullableString(json['authType']),
      roles: _parseRoles(json['roles']),
      streakCount: _parseInt(json['streakCount']) ?? 0,
      lastStudiedAt: _parseNullableString(json['lastStudiedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'email': email,
      'fullName': fullName,
      'avatarUrl': avatarUrl,
      'phone': phone,
      'level': level,
      'emailVerified': emailVerified,
      'status': status,
      'authType': authType,
      'roles': roles,
      'streakCount': streakCount,
      'lastStudiedAt': lastStudiedAt,
    };
  }

  // Getters tiện ích cho UI profile.
  bool get isAdmin => roles.contains('ADMIN');

  String get displayPhone => _isBlank(phone) ? 'Chưa cập nhật' : phone!.trim();

  String get displayLevel => _isBlank(level) ? 'Mới bắt đầu' : level!.trim();

  String get displayEmailVerified =>
      emailVerified ? 'Đã xác thực' : 'Chưa xác thực';

  String get displayAuthType {
    switch (authType?.toUpperCase()) {
      case 'GOOGLE':
        return 'Google';
      case 'LOCAL':
        return 'Email & mật khẩu';
      default:
        return 'Không rõ';
    }
  }

  String get displayStatus {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'Đang hoạt động';
      case 'INACTIVE':
        return 'Không hoạt động';
      case 'BANNED':
      case 'LOCKED':
        return 'Đã bị khóa';
      default:
        return 'Không rõ';
    }
  }

  String get roleText => roles.isEmpty ? 'USER' : roles.join(', ');

  String get avatarInitial {
    if (fullName.trim().isNotEmpty) {
      return fullName.trim()[0].toUpperCase();
    }
    if (email.trim().isNotEmpty) {
      return email.trim()[0].toUpperCase();
    }
    return 'U';
  }

  static int? _parseInt(dynamic value) {
    if (value is int) {
      return value;
    }
    if (value is num) {
      return value.toInt();
    }
    return int.tryParse(value?.toString() ?? '');
  }

  static String _parseString(dynamic value) {
    return value?.toString().trim() ?? '';
  }

  static String? _parseNullableString(dynamic value) {
    final text = _parseString(value);
    return text.isEmpty ? null : text;
  }

  static List<String> _parseRoles(dynamic value) {
    if (value is List) {
      return value
          .map((role) => role.toString())
          .where((role) => role.isNotEmpty)
          .toList();
    }
    return [];
  }

  static bool _isBlank(String? value) {
    return value == null || value.trim().isEmpty;
  }
}
