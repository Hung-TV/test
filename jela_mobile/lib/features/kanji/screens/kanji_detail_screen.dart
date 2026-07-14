import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/localization/app_translations.dart';

import '../../../common/theme/app_colors.dart';
import '../../../common/theme/app_text_styles.dart';
import '../models/kanji_models.dart';
import '../providers/kanji_provider.dart';
import '../providers/kanji_list_provider.dart';

class KanjiDetailScreen extends StatefulWidget {
  final int kanjiId;
  final String character;

  const KanjiDetailScreen({
    super.key,
    required this.kanjiId,
    required this.character,
  });

  @override
  State<KanjiDetailScreen> createState() => _KanjiDetailScreenState();
}

class _KanjiDetailScreenState extends State<KanjiDetailScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<KanjiProvider>().loadDetail(widget.kanjiId);
    });
  }

  void _showAddToListSheet(KanjiDetail detail) {
    context.read<KanjiListProvider>().loadLists();

    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.background,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (sheetContext) {
        return Consumer<KanjiListProvider>(
          builder: (context, listProvider, child) {
            return Container(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Thêm vào danh sách',
                        style: AppTextStyles.bodyLg.copyWith(
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () => Navigator.pop(sheetContext),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  if (listProvider.isLoading)
                    const Center(
                      child: Padding(
                        padding: EdgeInsets.all(24.0),
                        child: CircularProgressIndicator(
                          valueColor:
                              AlwaysStoppedAnimation<Color>(AppColors.primary),
                        ),
                      ),
                    )
                  else if (listProvider.lists.isEmpty)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 24),
                      child: Column(
                        children: [
                          const Icon(Icons.bookmarks_outlined,
                              size: 48, color: AppColors.outline),
                          const SizedBox(height: 8),
                          Text(
                            'Bạn chưa có danh sách học Kanji nào.',
                            style: AppTextStyles.bodyMd.copyWith(
                                color: AppColors.textSecondary),
                          ),
                          const SizedBox(height: 16),
                          ElevatedButton(
                            onPressed: () {
                              Navigator.pop(sheetContext);
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text(
                                      'Vui lòng qua tab "Danh sách học" để kích hoạt lộ trình.'),
                                ),
                              );
                            },
                            child: Text(AppTranslations.get(context, 'kanji', 'activateNow')),
                          ),
                        ],
                      ),
                    )
                  else
                    Flexible(
                      child: ListView.builder(
                        shrinkWrap: true,
                        itemCount: listProvider.lists.length,
                        itemBuilder: (context, index) {
                          final list = listProvider.lists[index];
                          return Card(
                            margin: const EdgeInsets.only(bottom: 8),
                            child: ListTile(
                              leading: const Icon(Icons.collections_bookmark,
                                  color: AppColors.primary),
                              title: Text(list.listName),
                              trailing:
                                  const Icon(Icons.chevron_right, size: 16),
                              onTap: () async {
                                Navigator.pop(sheetContext);
                                final success = await listProvider
                                    .addKanjiToList(list.listId, detail.id);
                                if (!context.mounted) return;
                                if (success) {
                                  _showSnackBar(
                                      AppTranslations.get(context, 'kanji', 'addToList')
                                          .replaceAll('{kanji}', widget.character)
                                          .replaceAll('{list}', list.listName));
                                } else {
                                  _showSnackBar(listProvider.errorMessage ??
                                      AppTranslations.get(context, 'kanji', 'errorAddToList'));
                                }
                              },
                            ),
                          );
                        },
                      ),
                    ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  void _showSnackBar(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(message)));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(AppTranslations.get(context, 'kanji', 'kanjiDetail').replaceAll('{character}', widget.character)),
        elevation: 0,
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.textPrimary,
      ),
      body: Consumer<KanjiProvider>(
        builder: (context, provider, child) {
          final detail = provider.getCachedDetail(widget.kanjiId);

          if (provider.isLoadingDetail && detail == null) {
            return const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
              ),
            );
          }

          if (provider.detailError != null && detail == null) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.error_outline,
                        size: 60, color: AppColors.error),
                    const SizedBox(height: 12),
                    Text(
                      provider.detailError!,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () => provider.loadDetail(widget.kanjiId),
                      child: Text(AppTranslations.get(context, 'kanji', 'tryAgain')),
                    ),
                  ],
                ),
              ),
            );
          }

          if (detail == null) {
            return Center(child: Text(AppTranslations.get(context, 'kanji', 'noDetailInfo')));
          }

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              // Main Character Info Card
              Card(
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(24),
                  side: const BorderSide(color: AppColors.outlineVariant),
                ),
                color: AppColors.surface,
                child: Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Row(
                    children: [
                      Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          color: AppColors.primary.withValues(alpha: 0.05),
                          shape: BoxShape.circle,
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          detail.character,
                          style: AppTextStyles.japaneseLg.copyWith(
                            fontSize: 40,
                            color: AppColors.primary,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      const SizedBox(width: 20),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              detail.meaning.toUpperCase(),
                              style: AppTextStyles.bodyLg.copyWith(
                                fontWeight: FontWeight.bold,
                                color: AppColors.textPrimary,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              '${AppTranslations.get(context, 'kanji', 'level')}: ${detail.level}',
                              style: AppTextStyles.bodyMd.copyWith(
                                color: AppColors.textSecondary,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '${AppTranslations.get(context, 'kanji', 'strokeCount')}: ${detail.strokeCount} | ${AppTranslations.get(context, 'kanji', 'radical')}: ${detail.radical ?? AppTranslations.get(context, 'kanji', 'unknown')}',
                              style: AppTextStyles.bodyMd.copyWith(
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Onyomi & Kunyomi Card
              _buildSectionCard(
                title: AppTranslations.get(context, 'kanji', 'readings'),
                icon: Icons.volume_up,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(AppTranslations.get(context, 'kanji', 'onyomi'),
                        style: TextStyle(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 6),
                    if (detail.onyomi.isEmpty)
                      Text(AppTranslations.get(context, 'kanji', 'noOnyomi'))
                    else
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: detail.onyomi.map((on) {
                          return Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: AppColors.primary.withValues(alpha: 0.05),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(
                                color: AppColors.primary.withValues(alpha: 0.15),
                              ),
                            ),
                            child: Text(
                              on,
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                color: AppColors.primary,
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                    const SizedBox(height: 16),
                    Text(AppTranslations.get(context, 'kanji', 'kunyomi'),
                        style: TextStyle(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 6),
                    if (detail.kunyomi.isEmpty)
                      Text(AppTranslations.get(context, 'kanji', 'noKunyomi'))
                    else
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: detail.kunyomi.map((kun) {
                          return Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: Colors.green.withValues(alpha: 0.05),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(
                                color: Colors.green.withValues(alpha: 0.2),
                              ),
                            ),
                            child: Text(
                              kun,
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                color: Colors.green,
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // On/Kun Examples
              if (detail.onExamples.isNotEmpty)
                _buildSectionCard(
                  title: AppTranslations.get(context, 'kanji', 'onExamples'),
                  icon: Icons.list_alt,
                  child: Column(
                    children: detail.onExamples.map((ex) {
                      return ListTile(
                        contentPadding: EdgeInsets.zero,
                        title: Text(
                          '${ex.word} [${ex.hiragana}]',
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        subtitle: Text(ex.meaning),
                      );
                    }).toList(),
                  ),
                ),

              if (detail.onExamples.isNotEmpty) const SizedBox(height: 16),

              if (detail.kunExamples.isNotEmpty)
                _buildSectionCard(
                  title: AppTranslations.get(context, 'kanji', 'kunExamples'),
                  icon: Icons.list_alt,
                  child: Column(
                    children: detail.kunExamples.map((ex) {
                      return ListTile(
                        contentPadding: EdgeInsets.zero,
                        title: Text(
                          '${ex.word} [${ex.hiragana}]',
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        subtitle: Text(ex.meaning),
                      );
                    }).toList(),
                  ),
                ),

              const SizedBox(height: 80), // spacer for FAB
            ],
          );
        },
      ),
      floatingActionButton: Consumer<KanjiProvider>(
        builder: (context, provider, child) {
          final detail = provider.getCachedDetail(widget.kanjiId);
          if (detail == null) return const SizedBox.shrink();

          return FloatingActionButton.extended(
            onPressed: () => _showAddToListSheet(detail),
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
            icon: const Icon(Icons.bookmark_add),
            label: Text(AppTranslations.get(context, 'kanji', 'addToLearningList')),
          );
        },
      ),
    );
  }

  Widget _buildSectionCard({
    required String title,
    required IconData icon,
    required Widget child,
  }) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: const BorderSide(color: AppColors.outlineVariant),
      ),
      color: AppColors.surface,
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, color: AppColors.primary, size: 20),
                const SizedBox(width: 8),
                Text(
                  title,
                  style: AppTextStyles.bodyLg.copyWith(
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
              ],
            ),
            const Divider(height: 24),
            child,
          ],
        ),
      ),
    );
  }
}
