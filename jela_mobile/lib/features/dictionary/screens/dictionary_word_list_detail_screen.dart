import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../common/theme/app_colors.dart';
import '../../../common/theme/app_text_styles.dart';
import '../models/dictionary_word_list.dart';
import '../providers/dictionary_list_detail_provider.dart';
import '../providers/dictionary_list_provider.dart';
import 'dictionary_detail_screen.dart';
import 'dictionary_session_screen.dart';
import '../../../core/localization/app_translations.dart';

class DictionaryWordListDetailScreen extends StatefulWidget {
  final int listId;
  final String listName;

  const DictionaryWordListDetailScreen({
    super.key,
    required this.listId,
    required this.listName,
  });

  @override
  State<DictionaryWordListDetailScreen> createState() =>
      _DictionaryWordListDetailScreenState();
}

class _DictionaryWordListDetailScreenState
    extends State<DictionaryWordListDetailScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context
          .read<DictionaryListDetailProvider>()
          .loadDetails(widget.listId, resetPage: true);
      context.read<DictionaryListProvider>().loadLists();
    });
  }

  void _onWordTap(int wordId) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => DictionaryDetailScreen(id: wordId),
      ),
    );
  }

  void _startSession({required bool isReview}) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => DictionarySessionScreen(
          listId: widget.listId,
          listName: widget.listName,
          isReview: isReview,
        ),
      ),
    ).then((_) {
      if (mounted) {
        context
            .read<DictionaryListDetailProvider>()
            .loadDetails(widget.listId, resetPage: true);
        context.read<DictionaryListProvider>().loadLists();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final listsProvider = context.watch<DictionaryListProvider>();
    final DictionaryWordList listSummary = listsProvider.lists.firstWhere(
      (l) => l.id == widget.listId,
      orElse: () => DictionaryWordList(
        id: widget.listId,
        name: widget.listName,
        wordCount: 0,
        dueCount: 0,
        masteredCount: 0,
        newCount: 0,
        learningCount: 0,
        completed: false,
      ),
    );

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(listSummary.name),
        elevation: 0,
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.textPrimary,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              context
                  .read<DictionaryListDetailProvider>()
                  .refresh(widget.listId);
              context.read<DictionaryListProvider>().loadLists();
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Stats Card
          _buildStatsCard(listSummary),

          // Action buttons: Learn & Review
          _buildActionButtons(listSummary),

          const Divider(height: 1),

          // Words list header
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  AppTranslations.get(context, 'dictionary', 'vocabListTitle'),
                  style: AppTextStyles.bodyLg.copyWith(
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                Text(
                  AppTranslations.get(context, 'dictionary', 'totalWordsCount').replaceAll('{count}', listSummary.wordCount.toString()),
                  style: AppTextStyles.bodyMd.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),

          // Paginated word list
          Expanded(
            child: Consumer<DictionaryListDetailProvider>(
              builder: (context, provider, child) {
                if (provider.isLoading) {
                  return const Center(
                    child: CircularProgressIndicator(
                      valueColor:
                          AlwaysStoppedAnimation<Color>(AppColors.primary),
                    ),
                  );
                }

                if (provider.errorMessage != null) {
                  return Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24.0),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(
                            Icons.error_outline_rounded,
                            size: 60,
                            color: AppColors.error,
                          ),
                          const SizedBox(height: 12),
                          Text(
                            provider.errorMessage!,
                            style: AppTextStyles.bodyMd.copyWith(
                              color: AppColors.textSecondary,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 16),
                          ElevatedButton(
                            onPressed: () => provider.loadDetails(widget.listId),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              foregroundColor: Colors.white,
                            ),
                            child: Text(AppTranslations.get(context, 'dictionary', 'retry')),
                          ),
                        ],
                      ),
                    ),
                  );
                }

                final detail = provider.detail;
                if (detail == null || detail.words.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(
                          Icons.inbox_outlined,
                          size: 60,
                          color: AppColors.outline,
                        ),
                        const SizedBox(height: 12),
                        Text(
                          AppTranslations.get(context, 'dictionary', 'noVocabInList'),
                          style: AppTextStyles.bodyMd.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  );
                }

                return Column(
                  children: [
                    Expanded(
                      child: RefreshIndicator(
                        onRefresh: () async {
                          await provider.refresh(widget.listId);
                          if (context.mounted) {
                            await context.read<DictionaryListProvider>().loadLists();
                          }
                        },
                        child: ListView.builder(
                          physics: const AlwaysScrollableScrollPhysics(
                            parent: BouncingScrollPhysics(),
                          ),
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          itemCount: detail.words.length,
                          itemBuilder: (context, index) {
                            final word = detail.words[index];
                            return Card(
                              elevation: 0,
                              margin: const EdgeInsets.only(bottom: 8),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                                side: const BorderSide(
                                    color: AppColors.outlineVariant),
                              ),
                              color: AppColors.surface,
                              child: InkWell(
                                onTap: () => _onWordTap(word.id),
                                borderRadius: BorderRadius.circular(12),
                                child: Padding(
                                  padding: const EdgeInsets.all(16),
                                  child: Row(
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.all(8),
                                        decoration: BoxDecoration(
                                          color: AppColors.primary
                                              .withValues(alpha: 0.05),
                                          borderRadius:
                                              BorderRadius.circular(8),
                                        ),
                                        child: const Icon(
                                          Icons.g_translate_outlined,
                                          color: AppColors.primary,
                                          size: 20,
                                        ),
                                      ),
                                      const SizedBox(width: 16),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              word.displayWord,
                                              style: AppTextStyles.japaneseMd
                                                  .copyWith(
                                                color: AppColors.textPrimary,
                                                fontWeight: FontWeight.w600,
                                              ),
                                            ),
                                            if (word.kanji != null &&
                                                word.kanji!.trim().isNotEmpty) ...[
                                              const SizedBox(height: 2),
                                              Text(
                                                word.displayReading,
                                                style: AppTextStyles.bodyMd
                                                    .copyWith(
                                                  color:
                                                      AppColors.textSecondary,
                                                ),
                                              ),
                                            ],
                                          ],
                                        ),
                                      ),
                                      const Icon(
                                        Icons.chevron_right_rounded,
                                        color: AppColors.outline,
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                    ),
                    _buildPaginationBar(provider),
                  ],
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsCard(DictionaryWordList listSummary) {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.outlineVariant),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildStatItem(AppTranslations.get(context, 'dictionary', 'newWords'), listSummary.newCount, AppColors.primary),
          _buildStatItem(AppTranslations.get(context, 'dictionary', 'learningWords'), listSummary.learningCount,
              AppColors.secondary),
          _buildStatItem(
              AppTranslations.get(context, 'dictionary', 'dueWords'), listSummary.dueCount, AppColors.gamification),
          _buildStatItem(AppTranslations.get(context, 'dictionary', 'masteredWords'), listSummary.masteredCount,
              const Color(0xFF2E7D32)),
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, int count, Color color) {
    return Column(
      children: [
        Text(
          '$count',
          style: AppTextStyles.bodyLg.copyWith(
            fontWeight: FontWeight.w800,
            fontSize: 22,
            color: color,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: AppTextStyles.bodyMd.copyWith(
            color: AppColors.textSecondary,
            fontSize: 12,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  Widget _buildActionButtons(DictionaryWordList listSummary) {
    final canLearn = listSummary.wordCount > 0;
    final canReview = listSummary.wordCount > 0;

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      child: Row(
        children: [
          Expanded(
            child: ElevatedButton(
              onPressed: canLearn ? () => _startSession(isReview: false) : null,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                disabledBackgroundColor:
                    AppColors.primary.withValues(alpha: 0.15),
                disabledForegroundColor: AppColors.textMuted,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                elevation: 0,
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.school_outlined, size: 20),
                  const SizedBox(width: 8),
                  Text(
                    AppTranslations.get(context, 'dictionary', 'learnNewWords'),
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  if (listSummary.newCount > 0) ...[
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        '${listSummary.newCount}',
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: ElevatedButton(
              onPressed:
                  canReview ? () => _startSession(isReview: true) : null,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.gamification,
                foregroundColor: Colors.white,
                disabledBackgroundColor:
                    AppColors.gamification.withValues(alpha: 0.15),
                disabledForegroundColor: AppColors.textMuted,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                elevation: 0,
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.history_edu_outlined, size: 20),
                  const SizedBox(width: 8),
                  Text(
                    AppTranslations.get(context, 'dictionary', 'reviewAction'),
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  if (listSummary.dueCount > 0) ...[
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        '${listSummary.dueCount}',
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPaginationBar(DictionaryListDetailProvider provider) {
    final detail = provider.detail;
    if (detail == null) return const SizedBox.shrink();

    final totalPages = detail.totalPages;
    final currentPage = provider.currentPage;

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      color: AppColors.surface,
      child: SafeArea(
        top: false,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            TextButton.icon(
              onPressed: currentPage > 1
                  ? () => provider.prevPage(widget.listId)
                  : null,
              icon: const Icon(Icons.chevron_left),
              label: Text(AppTranslations.get(context, 'dictionary', 'previousPage')),
              style: TextButton.styleFrom(
                foregroundColor: AppColors.primary,
              ),
            ),
            Text(
              AppTranslations.get(context, 'dictionary', 'pageIndicator')
                  .replaceAll('{current}', currentPage.toString())
                  .replaceAll('{total}', totalPages.toString()),
              style: AppTextStyles.bodyMd.copyWith(
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
            TextButton.icon(
              onPressed: currentPage < totalPages
                  ? () => provider.nextPage(widget.listId)
                  : null,
              icon: const Icon(Icons.chevron_right),
              label: Text(AppTranslations.get(context, 'dictionary', 'nextPage')),
              style: TextButton.styleFrom(
                foregroundColor: AppColors.primary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
