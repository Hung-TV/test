import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'common/theme/app_colors.dart';
import 'common/theme/app_theme.dart';
import 'features/auth/screens/login_screen.dart';
import 'features/home/screens/main_navigation_screen.dart';
import 'providers/auth_provider.dart';
import 'providers/preferences_provider.dart';
import 'core/navigation/navigator_key.dart';

class JelaMobileApp extends StatelessWidget {
  const JelaMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    final prefs = context.watch<PreferencesProvider>();

    return MaterialApp(
      navigatorKey: navigatorKey,
      title: 'JELA Mobile',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: prefs.themeMode,
      locale: prefs.locale,
      home: Consumer<AuthProvider>(
        builder: (context, authProvider, child) {
          if (authProvider.isCheckingLoginStatus) {
            return const Scaffold(
              backgroundColor: AppColors.background,
              body: Center(child: CircularProgressIndicator()),
            );
          }

          if (authProvider.isLoggedIn) {
            return const MainNavigationScreen();
          }

          return const LoginScreen();
        },
      ),
    );
  }
}
