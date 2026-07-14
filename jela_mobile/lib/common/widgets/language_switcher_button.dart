import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/preferences_provider.dart';

class LanguageSwitcherButton extends StatelessWidget {
  final Color? color;

  const LanguageSwitcherButton({super.key, this.color});

  @override
  Widget build(BuildContext context) {
    return Consumer<PreferencesProvider>(
      builder: (context, provider, _) {
        final isVietnamese = provider.locale.languageCode == 'vi';

        return IconButton(
          icon: Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              border: Border.all(
                color: color ?? Theme.of(context).colorScheme.outlineVariant,
              ),
              borderRadius: BorderRadius.circular(12),
              color: Theme.of(context).colorScheme.surface,
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  Icons.language,
                  size: 16,
                  color: color ?? Theme.of(context).colorScheme.onSurface,
                ),
                const SizedBox(width: 4),
                Text(
                  isVietnamese ? 'VI' : 'EN',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: color ?? Theme.of(context).colorScheme.onSurface,
                  ),
                ),
              ],
            ),
          ),
          onPressed: () {
            provider.setLanguage(isVietnamese ? 'en' : 'vi');
          },
          tooltip: 'Thay đổi ngôn ngữ',
        );
      },
    );
  }
}
