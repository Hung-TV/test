import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:jela_mobile/app.dart';
import 'package:jela_mobile/providers/auth_provider.dart';
import 'package:jela_mobile/providers/preferences_provider.dart';

void main() {
  testWidgets('JELA Mobile app smoke test', (WidgetTester tester) async {
    // Thiết lập SharedPreferences giả lập cho môi trường test
    SharedPreferences.setMockInitialValues({});

    // Bọc app bằng Provider giống như trong main.dart
    await tester.pumpWidget(
      MultiProvider(
        providers: [
          ChangeNotifierProvider(
            create: (_) => PreferencesProvider(),
          ),
          ChangeNotifierProvider(
            create: (_) => AuthProvider(),
          ),
        ],
        child: const JelaMobileApp(),
      ),
    );

    // Chờ widget build xong
    await tester.pump();

    // Kiểm tra app có MaterialApp
    expect(find.byType(MaterialApp), findsOneWidget);
  });
}