import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../common/theme/app_colors.dart';
import '../../../common/theme/app_text_styles.dart';
import '../providers/kanji_provider.dart';
import 'kanji_detail_screen.dart';
import '../../../core/localization/app_translations.dart';

class KanjiHistoryScreen extends StatefulWidget {
  const KanjiHistoryScreen({super.key});

  @override
  State<KanjiHistoryScreen> createState() => _KanjiHistoryScreenState();
}

class _KanjiHistoryScreenState extends State<KanjiHistoryScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<KanjiProvider>().loadHistory();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(AppTranslations.get(context, 'kanji', 'searchHistory')),
        elevation: 0,
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.textPrimary,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Consumer<KanjiProvider>(
        builder: (context, provider, child) {
          if (provider.isLoadingHistory && provider.history.isEmpty) {
            return const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
              ),
            );
          }

          if (provider.history.isEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.history_toggle_off_outlined,
                      size: 72,
                      color: AppColors.outline,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      AppTranslations.get(context, 'kanji', 'historyEmpty'),
                      style: AppTextStyles.bodyLg.copyWith(
                        fontWeight: FontWeight.bold,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      AppTranslations.get(context, 'kanji', 'historyEmptyDesc'),
                      style: TextStyle(color: AppColors.textMuted),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () => provider.loadHistory(),
            color: AppColors.primary,
            child: ListView.separated(
              physics: const AlwaysScrollableScrollPhysics(
                parent: BouncingScrollPhysics(),
              ),
              padding: const EdgeInsets.all(16),
              itemCount: provider.history.length,
              separatorBuilder: (context, index) => const SizedBox(height: 10),
              itemBuilder: (context, index) {
                final item = provider.history[index];
                return Card(
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                    side: const BorderSide(color: AppColors.outlineVariant),
                  ),
                  color: AppColors.surface,
                  child: ListTile(
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 8,
                    ),
                    leading: Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: AppColors.secondary.withValues(alpha: 0.05),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        item.character,
                        style: AppTextStyles.japaneseMd.copyWith(
                          fontWeight: FontWeight.bold,
                          color: AppColors.secondary,
                          fontSize: 20,
                        ),
                      ),
                    ),
                    title: Text(
                      AppTranslations.get(context, 'kanji', 'kanjiDetail').replaceAll('{character}', item.character),
                      style: AppTextStyles.bodyLg.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    subtitle: Text(AppTranslations.get(context, 'kanji', 'viewedDetail')),
                    trailing: IconButton(
                      icon: const Icon(Icons.delete_outline,
                          color: AppColors.error, size: 24),
                      onPressed: () => provider.deleteHistory(item.id),
                    ),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => KanjiDetailScreen(
                            kanjiId: item.id,
                            character: item.character,
                          ),
                        ),
                      );
                    },
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
