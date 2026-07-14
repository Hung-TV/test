import 'package:flutter/material.dart';

/// Hệ thống kiểu chữ (Typography) của ứng dụng.
/// Màu chữ được lược bỏ để tự động thừa hưởng từ DefaultTextStyle của hệ thống
/// giúp đồng bộ tự nhiên giữa chế độ Sáng (Light) và Tối (Dark).
class AppTextStyles {
  static const String inter = 'Inter';
  static const String notoSansJp = 'Noto Sans JP';

  static const TextStyle headlineLgMobile = TextStyle(
    fontFamily: inter,
    fontSize: 24,
    fontWeight: FontWeight.w600,
  );

  static const TextStyle headlineMd = TextStyle(
    fontFamily: inter,
    fontSize: 24,
    fontWeight: FontWeight.w600,
  );

  static const TextStyle bodyLg = TextStyle(
    fontFamily: inter,
    fontSize: 18,
    fontWeight: FontWeight.w400,
  );

  static const TextStyle bodyMd = TextStyle(
    fontFamily: inter,
    fontSize: 16,
    fontWeight: FontWeight.w400,
  );

  static const TextStyle labelCaps = TextStyle(
    fontFamily: inter,
    fontSize: 12,
    fontWeight: FontWeight.w700,
    letterSpacing: 12 * 0.05, // 0.05em
  );

  static const TextStyle japaneseLg = TextStyle(
    fontFamily: notoSansJp,
    fontSize: 32,
    fontWeight: FontWeight.w500,
  );

  static const TextStyle japaneseMd = TextStyle(
    fontFamily: notoSansJp,
    fontSize: 20,
    fontWeight: FontWeight.w400,
  );
}
