import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../common/theme/app_colors.dart';
import '../../../common/theme/app_text_styles.dart';
import '../providers/kanji_provider.dart';
import '../providers/kanji_list_provider.dart';
import 'kanji_detail_screen.dart';
import 'kanji_session_screen.dart';
import 'kanji_history_screen.dart';
import 'handwriting_dialog.dart';
import '../../../core/localization/app_translations.dart';

class KanjiScreen extends StatefulWidget {
  const KanjiScreen({super.key});

  @override
  State<KanjiScreen> createState() => _KanjiScreenState();
}

class _KanjiScreenState extends State<KanjiScreen> {
  final TextEditingController _searchController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final provider = context.read<KanjiProvider>();
      provider.loadLevels().then((_) {
        // Tự động chọn N5 làm mặc định khi mở thư viện
        if (provider.levels.isNotEmpty) {
          provider.selectLevel(provider.levels.first.level);
        }
      });
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _onSearchChanged(String value) {
    context.read<KanjiProvider>().search(value);
  }

  void _clearSearch() {
    _searchController.clear();
    context.read<KanjiProvider>().clearSearch();
  }

  void _showBatchSizeDialog(BuildContext context, int listId, String level) {
    showDialog(
      context: context,
      builder: (ctx) {
        int selectedBatchSize = 10;
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              backgroundColor: AppColors.surface,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              title: Text(AppTranslations.get(context, 'kanji', 'selectBatchSize').replaceAll('{level}', level)),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(AppTranslations.get(context, 'kanji', 'selectBatchSizeDesc')),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [5, 10, 15, 20].map((size) {
                      final isSelected = selectedBatchSize == size;
                      return ChoiceChip(
                        label: Text('$size'),
                        selected: isSelected,
                        onSelected: (val) {
                          if (val) {
                            setDialogState(() {
                              selectedBatchSize = size;
                            });
                          }
                        },
                        selectedColor: AppColors.primary,
                        labelStyle: TextStyle(
                          color: isSelected ? Colors.white : AppColors.textPrimary,
                          fontWeight: FontWeight.bold,
                        ),
                      );
                    }).toList(),
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(ctx),
                  child: Text(AppTranslations.get(context, 'kanji', 'cancel')),
                ),
                ElevatedButton(
                  onPressed: () {
                    Navigator.pop(ctx);
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => KanjiSessionScreen(
                          listId: listId,
                          listName: 'JLPT $level',
                          batchSize: selectedBatchSize,
                        ),
                      ),
                    ).then((_) {
                      if (context.mounted) {
                        context.read<KanjiProvider>().loadLevels();
                      }
                    });
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: Text(AppTranslations.get(context, 'kanji', 'studyNow')),
                ),
              ],
            );
          }
        );
      }
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(AppTranslations.get(context, 'kanji', 'title')),
        actions: [
          IconButton(
            icon: const Icon(Icons.history, color: AppColors.primary),
            tooltip: AppTranslations.get(context, 'kanji', 'searchHistory'),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const KanjiHistoryScreen(),
                ),
              );
            },
          ),
          if (_searchController.text.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.close),
              onPressed: _clearSearch,
            )
        ],
      ),
      body: Consumer<KanjiProvider>(
        builder: (context, provider, child) {
          final isSearching = _searchController.text.trim().isNotEmpty;

          return RefreshIndicator(
            onRefresh: () async {
              await provider.loadLevels();
              if (provider.selectedLevel != null) {
                await provider.loadKanjiByLevel(provider.selectedLevel!, page: provider.currentPage);
              }
            },
            color: AppColors.primary,
            child: ListView(
              controller: _scrollController,
              physics: const AlwaysScrollableScrollPhysics(
                parent: BouncingScrollPhysics(),
              ),
              padding: const EdgeInsets.all(16),
              children: [
                // Ô tìm kiếm
                _buildSearchBar(provider),
                const SizedBox(height: 24),

                if (isSearching) ...[
                  // Kết quả tìm kiếm
                  _buildSearchResults(provider),
                ] else ...[
                  // Danh sách các N & Kanji phân trang
                  _buildLevelsSection(provider),
                  const SizedBox(height: 24),
                  _buildKanjiListSection(provider),
                ],
              ],
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          showDialog(
            context: context,
            builder: (context) => HandwritingDialog(
              searchController: _searchController,
              onSearch: (query) {
                setState(() {});
                context.read<KanjiProvider>().search(query);
              },
            ),
          );
        },
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Theme.of(context).colorScheme.onPrimary,
        tooltip: AppTranslations.get(context, 'kanji', 'handwritingSearch'),
        child: const Icon(Icons.edit),
      ),
    );
  }

  Widget _buildSearchBar(KanjiProvider provider) {
    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Theme.of(context).colorScheme.outlineVariant),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: TextField(
        controller: _searchController,
        onChanged: _onSearchChanged,
        style: const TextStyle(fontSize: 16),
        decoration: InputDecoration(
          hintText: AppTranslations.get(context, 'kanji', 'searchHint'),
          prefixIcon: Icon(Icons.search, color: Theme.of(context).colorScheme.outline),
          suffixIcon: _searchController.text.isNotEmpty
              ? IconButton(
                  icon: Icon(Icons.clear_rounded, color: Theme.of(context).colorScheme.outline),
                  onPressed: _clearSearch,
                )
              : null,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
          border: InputBorder.none,
        ),
      ),
    );
  }

  Widget _buildSearchResults(KanjiProvider provider) {
    if (provider.isLoadingSearch) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(32.0),
          child: CircularProgressIndicator(
            valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
          ),
        ),
      );
    }

    if (provider.searchResults.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            children: [
              const Icon(Icons.search_off_rounded, size: 60, color: AppColors.outline),
              const SizedBox(height: 12),
              Text(
                AppTranslations.get(context, 'kanji', 'searchEmpty'),
                style: TextStyle(color: AppColors.textSecondary),
              ),
            ],
          ),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '${AppTranslations.get(context, 'kanji', 'searchResults')} (${provider.searchResults.length})',
          style: AppTextStyles.bodyLg.copyWith(
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 12),
        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: provider.searchResults.length,
          itemBuilder: (context, index) {
            final item = provider.searchResults[index];
            return Card(
              margin: const EdgeInsets.only(bottom: 8),
              child: ListTile(
                leading: Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.05),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    item.character,
                    style: AppTextStyles.japaneseMd.copyWith(
                      color: AppColors.primary,
                      fontWeight: FontWeight.bold,
                      fontSize: 20,
                    ),
                  ),
                ),
                title: Text(
                  item.meaning,
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                subtitle: Text(item.reading.isNotEmpty ? item.reading : AppTranslations.get(context, 'kanji', 'noExamples')),
                trailing: const Icon(Icons.chevron_right, size: 16),
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
      ],
    );
  }

  Widget _buildLevelsSection(KanjiProvider provider) {
    if (provider.isLoadingLevels && provider.levels.isEmpty) {
      return const Center(
        child: CircularProgressIndicator(
          valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          AppTranslations.get(context, 'kanji', 'jlptLevelTitle'),
          style: AppTextStyles.bodyLg.copyWith(
            fontWeight: FontWeight.bold,
            color: Theme.of(context).colorScheme.onSurface,
          ),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 204,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            itemCount: provider.levels.length,
            itemBuilder: (context, index) {
              final levelInfo = provider.levels[index];
              final isSelected = provider.selectedLevel == levelInfo.level;
              final percent = (levelInfo.progress * 100).round();

              return Container(
                width: 144,
                margin: const EdgeInsets.only(right: 12),
                child: Card(
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                    side: BorderSide(
                      color: isSelected ? Theme.of(context).colorScheme.primary : Theme.of(context).colorScheme.outlineVariant,
                      width: isSelected ? 2 : 1,
                    ),
                  ),
                  color: isSelected ? Theme.of(context).colorScheme.primary.withValues(alpha: 0.08) : Theme.of(context).colorScheme.surface,
                  child: InkWell(
                    onTap: () => provider.selectLevel(levelInfo.level),
                    borderRadius: BorderRadius.circular(16),
                    child: Padding(
                      padding: const EdgeInsets.all(12.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                levelInfo.level,
                                style: TextStyle(
                                  fontWeight: FontWeight.w900,
                                  fontSize: 16,
                                  color: Theme.of(context).colorScheme.primary,
                                ),
                              ),
                              Text(
                                levelInfo.level == 'N5' ? AppTranslations.get(context, 'kanji', 'levelN5') : 
                                levelInfo.level == 'N4' ? AppTranslations.get(context, 'kanji', 'levelN4') :
                                levelInfo.level == 'N3' ? AppTranslations.get(context, 'kanji', 'levelN3') :
                                levelInfo.level == 'N2' ? AppTranslations.get(context, 'kanji', 'levelN2') : AppTranslations.get(context, 'kanji', 'levelN1'),
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                                ),
                              ),
                            ],
                          ),
                          const Spacer(),
                          // Gauge tròn hiển thị phần trăm học
                          SizedBox(
                            width: 52,
                            height: 52,
                            child: Stack(
                              alignment: Alignment.center,
                              children: [
                                CircularProgressIndicator(
                                  value: levelInfo.progress,
                                  strokeWidth: 4,
                                  backgroundColor: Theme.of(context).colorScheme.surfaceContainerHighest,
                                  valueColor: AlwaysStoppedAnimation<Color>(
                                    Theme.of(context).colorScheme.secondary,
                                  ),
                                ),
                                Text(
                                  '$percent%',
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    color: Theme.of(context).colorScheme.secondary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const Spacer(),
                          Text(
                            AppTranslations.get(context, 'kanji', 'learnedOfTotal').replaceAll('{learned}', levelInfo.learnedKanji.toString()).replaceAll('{total}', levelInfo.totalKanji.toString()),
                            style: TextStyle(
                              fontSize: 11,
                              color: Theme.of(context).colorScheme.outline,
                            ),
                          ),
                          const SizedBox(height: 8),

                          // Nút Bắt đầu / Học ngay đồng bộ
                          SizedBox(
                            width: double.infinity,
                            height: 32,
                            child: ElevatedButton(
                              onPressed: () async {
                                if (levelInfo.listId == null) {
                                  // Chưa bắt đầu: gọi enroll
                                  final success = await context.read<KanjiListProvider>().startLevelList(levelInfo.level);
                                  if (success) {
                                    if (context.mounted) {
                                      context.read<KanjiProvider>().loadLevels();
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        SnackBar(content: Text(AppTranslations.get(context, 'kanji', 'activatedRoute').replaceAll('{level}', levelInfo.level))),
                                      );
                                    }
                                  }
                                } else {
                                  // Đã bắt đầu: hiện dialog chọn batch size và bắt đầu học
                                  _showBatchSizeDialog(context, levelInfo.listId!, levelInfo.level);
                                }
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: levelInfo.listId == null ? Theme.of(context).colorScheme.primary : Theme.of(context).colorScheme.secondary,
                                foregroundColor: levelInfo.listId == null ? Theme.of(context).colorScheme.onPrimary : Theme.of(context).colorScheme.onSecondary,
                                padding: EdgeInsets.zero,
                                elevation: 0,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                              ),
                              child: Text(
                                levelInfo.listId == null ? AppTranslations.get(context, 'kanji', 'start') : AppTranslations.get(context, 'kanji', 'studyLevel').replaceAll('{level}', levelInfo.level),
                                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildKanjiListSection(KanjiProvider provider) {
    if (provider.selectedLevel == null) return const SizedBox.shrink();

    if (provider.isLoadingKanjis && provider.kanjis.isEmpty) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(24.0),
          child: CircularProgressIndicator(),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              AppTranslations.get(context, 'kanji', 'kanjiListTitle').replaceAll('{level}', provider.selectedLevel ?? ''),
              style: AppTextStyles.bodyLg.copyWith(
                fontWeight: FontWeight.bold,
                color: Theme.of(context).colorScheme.onSurface,
              ),
            ),
            Text(
              AppTranslations.get(context, 'kanji', 'totalKanjiCount').replaceAll('{count}', provider.totalElements.toString()),
              style: TextStyle(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
                fontWeight: FontWeight.bold,
                fontSize: 12,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        if (provider.kanjis.isEmpty)
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surface,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Center(
              child: Text(AppTranslations.get(context, 'kanji', 'emptyKanjiList')),
            ),
          )
        else ...[
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: provider.kanjis.length,
            itemBuilder: (context, index) {
              final item = provider.kanjis[index];
              final sinoVietnamese = item.reading.toLowerCase();
              final meaningText = '[$sinoVietnamese] ${item.meaning}';

              return Card(
                elevation: 0,
                margin: const EdgeInsets.only(bottom: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: BorderSide(color: Theme.of(context).colorScheme.outlineVariant),
                ),
                color: Theme.of(context).colorScheme.surface,
                child: InkWell(
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
                  borderRadius: BorderRadius.circular(12),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    child: Row(
                      children: [
                        // Kanji character
                        Text(
                          item.character,
                          style: AppTextStyles.japaneseLg.copyWith(
                            fontSize: 32,
                            fontWeight: FontWeight.bold,
                            color: Theme.of(context).colorScheme.onSurface,
                          ),
                        ),
                        const SizedBox(width: 16),
                        // Meanings & Hán-Việt
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                meaningText,
                                style: AppTextStyles.bodyLg.copyWith(
                                  fontWeight: FontWeight.w600,
                                  fontSize: 15,
                                  color: Theme.of(context).colorScheme.onSurface,
                                ),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 4),
                              Text(
                                item.reading.toUpperCase(),
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ],
                          ),
                        ),
                        // Star bookmark icon
                        IconButton(
                          icon: Icon(Icons.star_border, color: Theme.of(context).colorScheme.outline),
                          onPressed: () {
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
                        // Three-dot menu icon
                        IconButton(
                          icon: Icon(Icons.more_vert, color: Theme.of(context).colorScheme.outline),
                          onPressed: () {
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
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
          const SizedBox(height: 16),
          // Bảng phân trang
          _buildPaginationFooter(provider),
        ],
      ],
    );
  }

  Widget _buildPaginationFooter(KanjiProvider provider) {
    final hasPrev = provider.currentPage > 1;
    final hasNext = provider.currentPage < provider.totalPages;

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        OutlinedButton.icon(
          onPressed: hasPrev
              ? () {
                  provider.loadKanjiByLevel(provider.selectedLevel!, page: provider.currentPage - 1);
                  _scrollController.animateTo(120, duration: const Duration(milliseconds: 300), curve: Curves.easeInOut);
                }
              : null,
          icon: const Icon(Icons.arrow_back, size: 16),
          label: Text(AppTranslations.get(context, 'kanji', 'prevPage')),
          style: OutlinedButton.styleFrom(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
        ),
        Text(
          AppTranslations.get(context, 'kanji', 'pageCount').replaceAll('{current}', provider.currentPage.toString()).replaceAll('{total}', provider.totalPages.toString()),
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
        ),
        OutlinedButton.icon(
          onPressed: hasNext
              ? () {
                  provider.loadKanjiByLevel(provider.selectedLevel!, page: provider.currentPage + 1);
                  _scrollController.animateTo(120, duration: const Duration(milliseconds: 300), curve: Curves.easeInOut);
                }
              : null,
          icon: const Icon(Icons.arrow_forward, size: 16),
          label: Text(AppTranslations.get(context, 'kanji', 'nextPage')),
          style: OutlinedButton.styleFrom(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
        ),
      ],
    );
  }
}
