import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'app.dart';
import 'features/dictionary/providers/dictionary_history_provider.dart';
import 'features/dictionary/providers/dictionary_list_provider.dart';
import 'features/dictionary/providers/dictionary_provider.dart';
import 'features/dictionary/providers/dictionary_list_detail_provider.dart';
import 'features/dictionary/providers/dictionary_session_provider.dart';
import 'features/kanji/providers/kanji_list_provider.dart';
import 'features/kanji/providers/kanji_session_provider.dart';
import 'features/kanji/providers/kanji_provider.dart';
import 'providers/auth_provider.dart';
import 'providers/preferences_provider.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (_) => PreferencesProvider(),
        ),
        // Quản lý trạng thái đăng nhập toàn app và tự kiểm tra token khi mở app.
        ChangeNotifierProvider(
          create: (_) => AuthProvider()..checkLoginStatus(),
        ),
        ChangeNotifierProvider(
          create: (_) => DictionaryProvider(),
        ),
        ChangeNotifierProvider(
          create: (_) => DictionaryHistoryProvider(),
        ),
        ChangeNotifierProvider(
          create: (_) => DictionaryListProvider(),
        ),
        ChangeNotifierProvider(
          create: (_) => DictionaryListDetailProvider(),
        ),
        ChangeNotifierProvider(
          create: (_) => DictionarySessionProvider(),
        ),
        ChangeNotifierProvider(
          create: (_) => KanjiListProvider(),
        ),
        ChangeNotifierProvider(
          create: (_) => KanjiSessionProvider(),
        ),
        ChangeNotifierProvider(
          create: (_) => KanjiProvider(),
        ),
      ],

      child: const JelaMobileApp(),
    ),
  );
}
