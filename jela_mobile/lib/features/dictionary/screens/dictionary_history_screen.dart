import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../common/theme/app_colors.dart';
import '../../../common/theme/app_text_styles.dart';
import '../providers/dictionary_history_provider.dart';
import 'dictionary_detail_screen.dart';
import '../../../core/localization/app_translations.dart';

class DictionaryHistoryScreen extends StatefulWidget {
  const DictionaryHistoryScreen({super.key});

  @override
  State<DictionaryHistoryScreen> createState() => _DictionaryHistoryScreenState();
}

class _DictionaryHistoryScreenState extends State<DictionaryHistoryScreen> {
  @override
  void initState() {
    super.initState();
    // Tải dữ liệu lịch sử ngay khi mở màn hình
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<DictionaryHistoryProvider>().loadHistory();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(AppTranslations.get(context, 'dictionary', 'searchHistory')),
        elevation: 0,
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.textPrimary,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Consumer<DictionaryHistoryProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading) {
            return const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
              ),
            );
          }

          if (provider.errorMessage != null) {
            return Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.error_outline_rounded,
                      size: 80,
                      color: AppColors.error,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      AppTranslations.get(context, 'dictionary', 'errorOccurred'),
                      style: AppTextStyles.bodyLg.copyWith(
                        color: AppColors.error,
                        fontWeight: FontWeight.w600,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      provider.errorMessage!,
                      style: AppTextStyles.bodyMd.copyWith(
                        color: AppColors.textSecondary,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton.icon(
                      onPressed: () => provider.loadHistory(),
                      icon: const Icon(Icons.refresh),
                      label: Text(AppTranslations.get(context, 'dictionary', 'retry')),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          }

          if (provider.history.isEmpty) {
            return RefreshIndicator(
              onRefresh: () => provider.refresh(),
              color: AppColors.primary,
              child: ListView(
                physics: const AlwaysScrollableScrollPhysics(
                  parent: BouncingScrollPhysics(),
                ),
                children: [
                  SizedBox(height: MediaQuery.of(context).size.height * 0.25),
                  const Icon(
                    Icons.history_toggle_off_rounded,
                    size: 80,
                    color: AppColors.outlineVariant,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    AppTranslations.get(context, 'dictionary', 'emptyHistory'),
                    style: AppTextStyles.bodyLg.copyWith(
                      color: AppColors.textSecondary,
                      fontWeight: FontWeight.w500,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 40),
                    child: Text(
                      AppTranslations.get(context, 'dictionary', 'emptyHistoryDesc'),
                      style: AppTextStyles.bodyMd.copyWith(
                        color: AppColors.textMuted,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () => provider.refresh(),
            color: AppColors.primary,
            child: ListView.separated(
              physics: const AlwaysScrollableScrollPhysics(
                parent: BouncingScrollPhysics(),
              ),
              padding: const EdgeInsets.all(16),
              itemCount: provider.history.length,
              separatorBuilder: (context, index) => const SizedBox(height: 8),
              itemBuilder: (context, index) {
                final item = provider.history[index];
                return Card(
                  margin: EdgeInsets.zero,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                    side: const BorderSide(color: AppColors.outlineVariant),
                  ),
                  color: AppColors.surface,
                  child: ListTile(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    leading: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.05),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.history,
                        color: AppColors.primary,
                      ),
                    ),
                    title: Text(
                      item.kanji,
                      style: AppTextStyles.japaneseMd.copyWith(
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    subtitle: Padding(
                      padding: const EdgeInsets.only(top: 4),
                      child: Text(
                        item.displayTime,
                        style: AppTextStyles.bodyMd.copyWith(
                          color: AppColors.textSecondary,
                          fontSize: 14,
                        ),
                      ),
                    ),
                    trailing: const Icon(
                      Icons.arrow_forward_ios,
                      size: 14,
                      color: AppColors.outline,
                    ),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => DictionaryDetailScreen(id: item.id),
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
