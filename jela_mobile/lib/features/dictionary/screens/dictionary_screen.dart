import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../common/theme/app_text_styles.dart';
import '../../kanji/screens/handwriting_dialog.dart';
import '../providers/dictionary_provider.dart';
import 'dictionary_detail_screen.dart';
import 'dictionary_history_screen.dart';
import 'my_dictionary_lists_screen.dart';
import '../../../core/localization/app_translations.dart';

class DictionaryScreen extends StatefulWidget {
  const DictionaryScreen({super.key});

  @override
  State<DictionaryScreen> createState() => _DictionaryScreenState();
}

class _DictionaryScreenState extends State<DictionaryScreen> {
  late final TextEditingController _searchController;
  Timer? _debounce;
  int _currentPage = 1;

  @override
  void initState() {
    super.initState();
    final provider = context.read<DictionaryProvider>();
    _searchController = TextEditingController(text: provider.currentKeyword);
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  void _onSearchChanged(String query) {
    if (_debounce?.isActive ?? false) _debounce!.cancel();
    _debounce = Timer(const Duration(milliseconds: 300), () {
      setState(() {
        _currentPage = 1; // Reset về trang 1 khi từ khóa tìm kiếm thay đổi
      });
      context.read<DictionaryProvider>().search(query);
    });
  }

  void _onSearch() {
    final provider = context.read<DictionaryProvider>();
    setState(() {
      _currentPage = 1;
    });
    provider.search(_searchController.text);
  }

  void _clearSearch() {
    setState(() {
      _searchController.clear();
      _currentPage = 1;
    });
    context.read<DictionaryProvider>().clearSearch();
  }

  Future<void> _openSaveToList({
    required int wordId,
    required String wordLabel,
  }) async {
    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) =>
            MyDictionaryListsScreen(wordId: wordId, wordLabel: wordLabel),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(AppTranslations.get(context, 'dictionary', 'title')),
        actions: [
          IconButton(
            icon: Icon(Icons.history, color: Theme.of(context).colorScheme.primary),
            tooltip: AppTranslations.get(context, 'dictionary', 'searchHistory'),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const DictionaryHistoryScreen(),
                ),
              );
            },
          ),
          IconButton(
            icon: Icon(
              Icons.folder_open_outlined,
              color: Theme.of(context).colorScheme.primary,
            ),
            tooltip: AppTranslations.get(context, 'dictionary', 'vocabNotebook'),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const MyDictionaryListsScreen(),
                ),
              );
            },
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Ô Tìm kiếm (Instant Search)
            TextField(
              controller: _searchController,
              textInputAction: TextInputAction.search,
              onSubmitted: (_) => _onSearch(),
              onChanged: _onSearchChanged,
              decoration: InputDecoration(
                hintText: AppTranslations.get(context, 'dictionary', 'searchHint2'),
                hintStyle: AppTextStyles.bodyMd.copyWith(
                  color: Theme.of(context).colorScheme.outline,
                ),
                prefixIcon: IconButton(
                  icon: Icon(Icons.search, color: Theme.of(context).colorScheme.primary),
                  onPressed: _onSearch,
                ),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: Icon(
                          Icons.clear,
                          color: Theme.of(context).colorScheme.outline,
                        ),
                        onPressed: _clearSearch,
                      )
                    : null,
                contentPadding: const EdgeInsets.symmetric(
                  vertical: 14,
                  horizontal: 16,
                ),
                filled: true,
                fillColor: Theme.of(context).colorScheme.surface,
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide(color: Theme.of(context).colorScheme.outlineVariant),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide(
                    color: Theme.of(context).colorScheme.primary,
                    width: 1.5,
                  ),
                ),
              ),
            ),

            const SizedBox(height: 16),

            // Danh sách kết quả & trạng thái
            Expanded(
              child: Consumer<DictionaryProvider>(
                builder: (context, provider, child) {
                  if (provider.isLoading) {
                    return Center(
                      child: CircularProgressIndicator(
                        color: Theme.of(context).colorScheme.primary,
                      ),
                    );
                  }

                  if (provider.errorMessage != null) {
                    return SingleChildScrollView(
                      child: Padding(
                        padding: const EdgeInsets.only(top: 48),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.error_outline_rounded,
                              size: 80,
                              color: Theme.of(context).colorScheme.error,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              AppTranslations.get(context, 'dictionary', 'errorOccurred'),
                              style: AppTextStyles.bodyLg.copyWith(
                                color: Theme.of(context).colorScheme.error,
                                fontWeight: FontWeight.w600,
                              ),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 8),
                            Padding(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 40,
                              ),
                              child: Text(
                                provider.errorMessage!,
                                style: AppTextStyles.bodyMd.copyWith(
                                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                                ),
                                textAlign: TextAlign.center,
                              ),
                            ),
                            const SizedBox(height: 16),
                            ElevatedButton.icon(
                              onPressed: _onSearch,
                              icon: const Icon(Icons.refresh),
                              label: Text(AppTranslations.get(context, 'dictionary', 'retry')),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Theme.of(context).colorScheme.primary,
                                foregroundColor: Theme.of(context).colorScheme.onPrimary,
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 24,
                                  vertical: 12,
                                ),
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

                  if (provider.currentKeyword.isEmpty) {
                    return SingleChildScrollView(
                      child: Padding(
                        padding: const EdgeInsets.only(top: 48),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.search_off_rounded,
                              size: 80,
                              color: Theme.of(context).colorScheme.outlineVariant,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              AppTranslations.get(context, 'dictionary', 'enterKeywordToStart'),
                              style: AppTextStyles.bodyLg.copyWith(
                                color: Theme.of(context).colorScheme.onSurfaceVariant,
                                fontWeight: FontWeight.w500,
                              ),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 8),
                            Padding(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 40,
                              ),
                              child: Text(
                                AppTranslations.get(context, 'dictionary', 'searchDescription'),
                                style: AppTextStyles.bodyMd.copyWith(
                                  color: Theme.of(context).colorScheme.outline,
                                ),
                                textAlign: TextAlign.center,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }

                  if (provider.results.isEmpty) {
                    return SingleChildScrollView(
                      child: Padding(
                        padding: const EdgeInsets.only(top: 48),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.sentiment_dissatisfied_rounded,
                              size: 80,
                              color: Theme.of(context).colorScheme.outlineVariant,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              AppTranslations.get(context, 'dictionary', 'noResultsFound'),
                              style: AppTextStyles.bodyLg.copyWith(
                                color: Theme.of(context).colorScheme.onSurfaceVariant,
                                fontWeight: FontWeight.w500,
                              ),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 8),
                            Padding(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 40,
                              ),
                              child: Text(
                                AppTranslations.get(context, 'dictionary', 'searchSuggestion'),
                                style: AppTextStyles.bodyMd.copyWith(
                                  color: Theme.of(context).colorScheme.outline,
                                ),
                                textAlign: TextAlign.center,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }

                  // Phân trang Client-Side: lấy tối đa 10 từ/trang
                  final totalResults = provider.results;
                  final totalItems = totalResults.length;
                  final totalPages = (totalItems / 10).ceil();
                  
                  // Giới hạn trang hiện tại
                  if (_currentPage > totalPages) {
                    _currentPage = totalPages;
                  }
                  if (_currentPage < 1) {
                    _currentPage = 1;
                  }

                  final start = (_currentPage - 1) * 10;
                  final end = (start + 10) < totalItems ? (start + 10) : totalItems;
                  final paginatedItems = totalResults.sublist(start, end);

                  return Column(
                    children: [
                      Expanded(
                        child: ListView.builder(
                          itemCount: paginatedItems.length,
                          physics: const BouncingScrollPhysics(),
                          itemBuilder: (context, index) {
                            final item = paginatedItems[index];
                            return Card(
                              margin: const EdgeInsets.only(bottom: 12),
                              elevation: 0,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                                side: BorderSide(
                                  color: Theme.of(context).colorScheme.outlineVariant,
                                ),
                              ),
                              color: Theme.of(context).colorScheme.surface,
                              child: InkWell(
                                onTap: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (context) =>
                                          DictionaryDetailScreen(id: item.id),
                                    ),
                                  );
                                },
                                borderRadius: BorderRadius.circular(16),
                                child: Padding(
                                  padding: const EdgeInsets.all(16),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.baseline,
                                        textBaseline: TextBaseline.alphabetic,
                                        children: [
                                          Text(
                                            item.displayWord,
                                            style: AppTextStyles.japaneseMd.copyWith(
                                              color: Theme.of(context).colorScheme.primary,
                                              fontWeight: FontWeight.w600,
                                            ),
                                          ),
                                          if (item.kanji != null &&
                                              item.kanji!.trim().isNotEmpty) ...[
                                            const SizedBox(width: 8),
                                            Text(
                                              '「${item.displayReading}」',
                                              style: AppTextStyles.bodyMd.copyWith(
                                                color: Theme.of(context).colorScheme.onSurfaceVariant,
                                              ),
                                            ),
                                          ],
                                        ],
                                      ),
                                      const SizedBox(height: 8),
                                      Row(
                                        crossAxisAlignment: CrossAxisAlignment.end,
                                        children: [
                                          Expanded(
                                            child: Text(
                                              item.displayMeaning,
                                              style: AppTextStyles.bodyMd.copyWith(
                                                color: Theme.of(context).colorScheme.onSurfaceVariant,
                                              ),
                                              maxLines: 2,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ),
                                          IconButton(
                                            tooltip: AppTranslations.get(context, 'dictionary', 'saveToList'),
                                            onPressed: () => _openSaveToList(
                                              wordId: item.id,
                                              wordLabel: item.displayWord,
                                            ),
                                            icon: Icon(
                                              Icons.bookmark_add_outlined,
                                              color: Theme.of(context).colorScheme.secondary,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            );
                          },
                        ),
                      ),

                      // Bảng phân trang 10 từ/trang giống Web
                      if (totalPages > 1) ...[
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            OutlinedButton.icon(
                              onPressed: _currentPage > 1
                                  ? () {
                                      setState(() {
                                        _currentPage--;
                                      });
                                    }
                                  : null,
                              icon: const Icon(Icons.arrow_back, size: 16),
                              label: Text(AppTranslations.get(context, 'dictionary', 'previousPage')),
                              style: OutlinedButton.styleFrom(
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10),
                                ),
                              ),
                            ),
                            Text(
                              AppTranslations.get(context, 'dictionary', 'pageIndicator')
                                  .replaceAll('{current}', _currentPage.toString())
                                  .replaceAll('{total}', totalPages.toString()),
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                              ),
                            ),
                            OutlinedButton.icon(
                              onPressed: _currentPage < totalPages
                                  ? () {
                                      setState(() {
                                        _currentPage++;
                                      });
                                    }
                                  : null,
                              icon: const Icon(Icons.arrow_forward, size: 16),
                              label: Text(AppTranslations.get(context, 'dictionary', 'nextPage')),
                              style: OutlinedButton.styleFrom(
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ],
                  );
                },
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          showDialog(
            context: context,
            builder: (context) => HandwritingDialog(
              searchController: _searchController,
              onSearch: (query) {
                setState(() {});
                context.read<DictionaryProvider>().search(query);
              },
            ),
          );
        },
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Theme.of(context).colorScheme.onPrimary,
        tooltip: AppTranslations.get(context, 'dictionary', 'handwritingSearch'),
        child: const Icon(Icons.edit),
      ),
    );
  }
}
