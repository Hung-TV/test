import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;

import '../storage/token_storage.dart';

class ApiClient {
  static void Function()? onUnauthorized;

  Map<String, String> _headers({required bool requireAuth, String? token}) {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (requireAuth && token != null && token.trim().isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }

    return headers;
  }

  Future<dynamic> get(String url, {bool requireAuth = true}) async {
    try {
      final token = requireAuth ? await TokenStorage.getToken() : null;
      final response = await http.get(
        Uri.parse(url),
        headers: _headers(requireAuth: requireAuth, token: token),
      );

      return _handleResponse(response);
    } on SocketException {
      throw Exception('Không thể kết nối internet. Vui lòng kiểm tra mạng.');
    } on http.ClientException catch (error) {
      throw Exception(_mapClientException(error));
    }
  }

  Future<dynamic> post(
    String url, {
    dynamic body,
    bool requireAuth = true,
  }) async {
    try {
      final token = requireAuth ? await TokenStorage.getToken() : null;
      final response = await http.post(
        Uri.parse(url),
        headers: _headers(requireAuth: requireAuth, token: token),
        body: jsonEncode(body ?? {}),
      );

      return _handleResponse(response);
    } on SocketException {
      throw Exception('Không thể kết nối internet. Vui lòng kiểm tra mạng.');
    } on http.ClientException catch (error) {
      throw Exception(_mapClientException(error));
    }
  }

  Future<dynamic> put(
    String url, {
    dynamic body,
    bool requireAuth = true,
  }) async {
    try {
      final token = requireAuth ? await TokenStorage.getToken() : null;
      final response = await http.put(
        Uri.parse(url),
        headers: _headers(requireAuth: requireAuth, token: token),
        body: jsonEncode(body ?? {}),
      );

      return _handleResponse(response);
    } on SocketException {
      throw Exception('Không thể kết nối internet. Vui lòng kiểm tra mạng.');
    } on http.ClientException catch (error) {
      throw Exception(_mapClientException(error));
    }
  }

  Future<dynamic> patch(
    String url, {
    dynamic body,
    bool requireAuth = true,
  }) async {
    try {
      final token = requireAuth ? await TokenStorage.getToken() : null;
      final response = await http.patch(
        Uri.parse(url),
        headers: _headers(requireAuth: requireAuth, token: token),
        body: jsonEncode(body ?? {}),
      );

      return _handleResponse(response);
    } on SocketException {
      throw Exception('Không thể kết nối internet. Vui lòng kiểm tra mạng.');
    } on http.ClientException catch (error) {
      throw Exception(_mapClientException(error));
    }
  }

  Future<dynamic> delete(
    String url, {
    bool requireAuth = true,
  }) async {
    try {
      final token = requireAuth ? await TokenStorage.getToken() : null;
      final response = await http.delete(
        Uri.parse(url),
        headers: _headers(requireAuth: requireAuth, token: token),
      );

      return _handleResponse(response);
    } on SocketException {
      throw Exception('Không thể kết nối internet. Vui lòng kiểm tra mạng.');
    } on http.ClientException catch (error) {
      throw Exception(_mapClientException(error));
    }
  }

  dynamic _handleResponse(http.Response response) {
    dynamic decoded;
    if (response.bodyBytes.isNotEmpty) {
      final utf8Body = utf8.decode(response.bodyBytes);
      if (utf8Body.trim().isNotEmpty) {
        try {
          decoded = jsonDecode(utf8Body);
        } catch (e) {
          decoded = utf8Body; // Fallback to raw utf8 string
        }
      }
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return decoded;
    }

    if (response.statusCode == 401 || response.statusCode == 403) {
      onUnauthorized?.call();
    }

    throw ApiException(
      statusCode: response.statusCode,
      message: _extractErrorMessage(decoded, response.statusCode),
    );
  }

  String _extractErrorMessage(dynamic decoded, int statusCode) {
    final rawMessage = _rawBackendMessage(decoded);

    if (statusCode == 401) {
      return 'Email hoặc mật khẩu không đúng.';
    }
    if (rawMessage != null) {
      return _localizeBackendMessage(rawMessage, statusCode);
    }

    return 'Đã xảy ra lỗi ($statusCode). Vui lòng thử lại.';
  }

  String? _rawBackendMessage(dynamic decoded) {
    if (decoded is Map) {
      final message =
          decoded['message'] ?? decoded['error'] ?? decoded['detail'];
      if (message != null && message.toString().trim().isNotEmpty) {
        return message.toString();
      }
    }

    if (decoded is String && decoded.trim().isNotEmpty) {
      return decoded;
    }

    return null;
  }

  String _localizeBackendMessage(String message, int statusCode) {
    final lowerMessage = message.toLowerCase();

    // Chuẩn hóa lỗi Bean Validation của Spring Boot sang câu dễ hiểu cho user.
    if (lowerMessage.contains('validation failed')) {
      if (lowerMessage.contains('email')) {
        if (lowerMessage.contains('well-formed')) {
          return 'Email không đúng định dạng. Ví dụ: ten@example.com';
        }
        if (lowerMessage.contains('blank') || lowerMessage.contains('empty')) {
          return 'Vui lòng nhập email.';
        }
      }
      if (lowerMessage.contains('password')) {
        return 'Vui lòng kiểm tra lại mật khẩu.';
      }
      return 'Thông tin đăng nhập chưa hợp lệ. Vui lòng kiểm tra lại.';
    }

    if (statusCode == 403) {
      return 'Tài khoản chưa được phép đăng nhập hoặc đã bị khóa.';
    }
    if (statusCode >= 500) {
      return 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau.';
    }

    return message;
  }

  String _mapClientException(http.ClientException error) {
    final message = error.message.toLowerCase();

    // Flutter Web/Chrome thường trả Failed to fetch khi backend tắt, sai baseUrl hoặc bị CORS.
    if (message.contains('failed to fetch') ||
        message.contains('xmlhttprequest')) {
      return 'Không kết nối được backend. Hãy kiểm tra baseUrl, backend port 8080 và CORS nếu chạy Chrome.';
    }

    return 'Không thể gửi yêu cầu đến backend. Vui lòng thử lại.';
  }
}

class ApiException implements Exception {
  final int statusCode;
  final String message;

  ApiException({required this.statusCode, required this.message});

  @override
  String toString() => message;
}
