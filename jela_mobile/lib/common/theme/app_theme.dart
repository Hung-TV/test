import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'app_colors.dart';
import 'app_text_styles.dart';

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: AppColors.background,
      colorScheme: const ColorScheme.light(
        primary: AppColors.primary,
        onPrimary: AppColors.onPrimary,
        primaryContainer: AppColors.primaryContainer,
        secondary: AppColors.secondary,
        onSecondary: AppColors.onSecondary,
        secondaryContainer: AppColors.secondaryContainer,
        error: AppColors.error,
        onError: AppColors.onError,
        surface: AppColors.surface,
        onSurface: AppColors.onSurface,
        outline: AppColors.outline,
        outlineVariant: AppColors.outlineVariant,
      ),

      appBarTheme: AppBarTheme(
        // Cần import 'package:flutter/services.dart'; ở đầu file để dùng SystemUiOverlayStyle
        systemOverlayStyle: SystemUiOverlayStyle.dark, // Ép icon pin, wifi, giờ thành màu đen
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: AppTextStyles.headlineLgMobile.copyWith(
          color: AppColors.textPrimary,
        ),
        iconTheme: const IconThemeData(color: AppColors.onSurface),
      ),

      cardTheme: CardThemeData(
        color: AppColors.surface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: AppColors.outlineVariant, width: 1),
        ),
        margin: EdgeInsets.zero,
      ),

      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.surface,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 14,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.outlineVariant),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.outlineVariant),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.secondary, width: 2),
        ),
        labelStyle: AppTextStyles.bodyMd.copyWith(
          color: AppColors.textSecondary,
        ),
        hintStyle: AppTextStyles.bodyMd.copyWith(color: AppColors.textMuted),
      ),

      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: AppColors.secondary,
          foregroundColor: AppColors.onSecondary,
          minimumSize: const Size.fromHeight(52),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.w600),
        ),
      ),

      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: AppColors.surface,
        indicatorColor: AppColors.secondary.withValues(alpha: 0.1),
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return AppTextStyles.labelCaps.copyWith(color: AppColors.secondary);
          }
          return AppTextStyles.labelCaps.copyWith(
            color: AppColors.textSecondary,
          );
        }),
        iconTheme: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const IconThemeData(color: AppColors.secondary);
          }
          return const IconThemeData(color: AppColors.textSecondary);
        }),
      ),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: const Color(0xFF121214),
      colorScheme: const ColorScheme.dark(
        primary: Color(0xFFADC6FF),
        onPrimary: Color(0xFF002D6E),
        primaryContainer: Color(0xFF00439A),
        onPrimaryContainer: Color(0xFFD8E2FF),
        secondary: Color(0xFFFFB0D0),
        onSecondary: Color(0xFF650041),
        secondaryContainer: Color(0xFF8F1261),
        onSecondaryContainer: Color(0xFFFFD9E6),
        error: Color(0xFFFFB4AB),
        onError: Color(0xFF690005),
        surface: Color(0xFF1A1A1E),
        onSurface: Color(0xFFE3E2E6),
        outline: Color(0xFF8F909A),
        outlineVariant: Color(0xFF44474F),
      ),

      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          fontFamily: AppTextStyles.inter,
          fontSize: 24,
          fontWeight: FontWeight.w600,
          color: Color(0xFFE3E2E6),
        ),
        iconTheme: IconThemeData(color: Color(0xFFE3E2E6)),
      ),

      cardTheme: CardThemeData(
        color: const Color(0xFF1E1E24),
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: Color(0xFF44474F), width: 1),
        ),
        margin: EdgeInsets.zero,
      ),

      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: const Color(0xFF1E1E24),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 14,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFF44474F)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFF44474F)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFFFB0D0), width: 2),
        ),
        labelStyle: const TextStyle(
          fontFamily: AppTextStyles.inter,
          fontSize: 16,
          fontWeight: FontWeight.w400,
          color: Color(0xFFC7C6CA),
        ),
        hintStyle: const TextStyle(
          fontFamily: AppTextStyles.inter,
          fontSize: 16,
          fontWeight: FontWeight.w400,
          color: Color(0xFF90909A),
        ),
      ),

      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: const Color(0xFFFFB0D0),
          foregroundColor: const Color(0xFF650041),
          minimumSize: const Size.fromHeight(52),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: const TextStyle(
            fontFamily: AppTextStyles.inter,
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),

      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: const Color(0xFF1E1E24),
        indicatorColor: const Color(0xFFFFB0D0).withValues(alpha: 0.1),
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const TextStyle(
              fontFamily: AppTextStyles.inter,
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: Color(0xFFFFB0D0),
            );
          }
          return const TextStyle(
            fontFamily: AppTextStyles.inter,
            fontSize: 12,
            fontWeight: FontWeight.w700,
            color: Color(0xFFC7C6CA),
          );
        }),
        iconTheme: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const IconThemeData(color: Color(0xFFFFB0D0));
          }
          return const IconThemeData(color: Color(0xFFC7C6CA));
        }),
      ),
    );
  }
}
