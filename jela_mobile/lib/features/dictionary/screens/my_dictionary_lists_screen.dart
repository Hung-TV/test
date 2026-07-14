import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../common/theme/app_text_styles.dart';
import '../models/dictionary_word_list.dart';
import '../providers/dictionary_list_provider.dart';
import 'dictionary_word_list_detail_screen.dart';
import '../../../core/localization/app_translations.dart';

class MyDictionaryListsScreen extends StatefulWidget {
  final int? wordId;
  final String? wordLabel;
  final bool showAppBar;

  const MyDictionaryListsScreen({
    super.key,
    this.wordId,
    this.wordLabel,
    this.showAppBar = true,
  });

  bool get isPickingList => wordId != null;

  @override
  State<MyDictionaryListsScreen> createState() =>
      _MyDictionaryListsScreenState();
}

class _MyDictionaryListsScreenState extends State<MyDictionaryListsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<DictionaryListProvider>().loadLists();
    });
  }

  Future<void> _addToExistingList(DictionaryWordList item) async {
    final wordId = widget.wordId;
    if (wordId == null) {
      _openListInfo(item);
      return;
    }

    final provider = context.read<DictionaryListProvider>();
    final success = await provider.addWordToList(
      listId: item.id,
      wordId: wordId,
    );

    if (!mounted) return;

    if (success) {
      _showSnackBar(AppTranslations.get(context, 'dictionary', 'addedWordToListSuccess').replaceAll('{list}', item.name));
      if (mounted) Navigator.pop(context, true);
    } else {
      _showSnackBar(AppTranslations.get(context, 'dictionary', 'addWordToListError'));
    }
  }

  void _showCreateDialog() {
    final wordId = widget.wordId;
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text(AppTranslations.get(context, 'dictionary', 'createList')),
        content: TextField(
          controller: controller,
          autofocus: true,
          maxLength: 100,
          decoration: InputDecoration(
            hintText: AppTranslations.get(context, 'dictionary', 'enterListNameHint'),
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 12,
            ),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: Text(AppTranslations.get(context, 'dictionary', 'cancel')),
          ),
          ElevatedButton(
            onPressed: () async {
              final name = controller.text.trim();
              if (name.isEmpty) {
                _showSnackBar(AppTranslations.get(context, 'dictionary', 'listNameNotEmpty'));
                return;
              }

              Navigator.pop(dialogContext);
              final provider = context.read<DictionaryListProvider>();

              if (wordId != null) {
                final success = await provider.addWordToNewList(
                  listName: name,
                  wordId: wordId,
                );

                if (!mounted) return;

                if (success) {
                  _showSnackBar(AppTranslations.get(context, 'dictionary', 'createListAndAddWordSuccess'));
                  Navigator.pop(context, true);
                } else {
                  _showSnackBar(
                    AppTranslations.get(context, 'dictionary', 'createListError'),
                  );
                }
              } else {
                final success = await provider.createList(name);

                if (!mounted) return;

                if (success) {
                  _showSnackBar(AppTranslations.get(context, 'dictionary', 'listCreated'));
                } else {
                  _showSnackBar(
                    AppTranslations.get(context, 'dictionary', 'createListError'),
                  );
                }
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Theme.of(context).colorScheme.primary,
              foregroundColor: Theme.of(context).colorScheme.onPrimary,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: Text(AppTranslations.get(context, 'dictionary', 'create')),
          ),
        ],
      ),
    );
  }

  void _openListInfo(DictionaryWordList item) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => DictionaryWordListDetailScreen(
          listId: item.id,
          listName: item.name,
        ),
      ),
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
    final isPickingList = widget.isPickingList;
    final colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: widget.showAppBar
          ? AppBar(
              title: Text(isPickingList 
                  ? AppTranslations.get(context, 'dictionary', 'selectListToSaveWord') 
                  : AppTranslations.get(context, 'dictionary', 'myLists')),
              leading: IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: () => Navigator.pop(context),
              ),
            )
          : null,
      body: Consumer<DictionaryListProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading) {
            return Center(
              child: CircularProgressIndicator(
                color: colorScheme.primary,
              ),
            );
          }

          if (provider.errorMessage != null) {
            return _ErrorState(
              message: provider.errorMessage!,
              onRetry: provider.loadLists,
            );
          }

          return RefreshIndicator(
            onRefresh: provider.refresh,
            color: colorScheme.primary,
            child: ListView(
              physics: const AlwaysScrollableScrollPhysics(
                parent: BouncingScrollPhysics(),
              ),
              padding: const EdgeInsets.all(16),
              children: [
                if (isPickingList)
                  _PickerHeader(
                    wordLabel: widget.wordLabel,
                    onCreate: _showCreateDialog,
                  )
                else
                  const _ReadOnlyHeader(),
                const SizedBox(height: 16),
                if (provider.lists.isEmpty)
                  _EmptyState(isPickingList: isPickingList)
                else
                  ...provider.lists.map(
                    (item) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: _ListCard(
                        item: item,
                        isPickingList: isPickingList,
                        onTap: () => _addToExistingList(item),
                      ),
                    ),
                  ),
              ],
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showCreateDialog,
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Theme.of(context).colorScheme.onPrimary,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        child: const Icon(Icons.add),
      ),
    );
  }
}

class _PickerHeader extends StatelessWidget {
  final String? wordLabel;
  final VoidCallback onCreate;

  const _PickerHeader({required this.wordLabel, required this.onCreate});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: colorScheme.outlineVariant),
      ),
      child: Row(
        children: [
          Icon(Icons.bookmark_add_outlined, color: colorScheme.primary),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              wordLabel == null
                  ? AppTranslations.get(context, 'dictionary', 'chooseList')
                  : AppTranslations.get(context, 'dictionary', 'saveWordToListTitle').replaceAll('{word}', wordLabel!),
              style: AppTextStyles.bodyMd.copyWith(
                color: colorScheme.onSurfaceVariant,
              ),
            ),
          ),
          IconButton(
            onPressed: onCreate,
            icon: const Icon(Icons.add_circle_outline),
            color: colorScheme.primary,
            tooltip: AppTranslations.get(context, 'dictionary', 'createList'),
          ),
        ],
      ),
    );
  }
}

class _ReadOnlyHeader extends StatelessWidget {
  const _ReadOnlyHeader();

  @override
  Widget build(BuildContext context) {
    return const SizedBox.shrink();
  }
}

class _ListCard extends StatelessWidget {
  final DictionaryWordList item;
  final bool isPickingList;
  final VoidCallback onTap;

  const _ListCard({
    required this.item,
    required this.isPickingList,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    if (isPickingList) {
      return Card(
        margin: EdgeInsets.zero,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: colorScheme.outlineVariant),
        ),
        color: colorScheme.surface,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: colorScheme.secondary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    Icons.add_box_outlined,
                    color: colorScheme.secondary,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        item.name,
                        style: AppTextStyles.bodyLg.copyWith(
                          fontWeight: FontWeight.w600,
                          color: colorScheme.onSurface,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        item.displayWordCount,
                        style: AppTextStyles.bodyMd.copyWith(
                          color: colorScheme.onSurfaceVariant,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ),
                Icon(
                  Icons.check_circle_outline,
                  size: 20,
                  color: colorScheme.outline,
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Card(
      elevation: 0,
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: BorderSide(color: colorScheme.outlineVariant),
      ),
      color: colorScheme.surface,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      item.name,
                      style: AppTextStyles.bodyLg.copyWith(
                        fontWeight: FontWeight.bold,
                        color: colorScheme.primary,
                        fontSize: 18,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  Icon(
                    Icons.info_outline,
                    size: 20,
                    color: colorScheme.outline,
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildStatItem(context, AppTranslations.get(context, 'dictionary', 'totalWords'), item.wordCount),
                  _buildStatItem(context, AppTranslations.get(context, 'dictionary', 'newWords'), item.newCount),
                  _buildStatItem(context, AppTranslations.get(context, 'dictionary', 'learningWords'), item.learningCount),
                  _buildStatItem(context, AppTranslations.get(context, 'dictionary', 'masteredWords'), item.masteredCount),
                ],
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: onTap,
                style: ElevatedButton.styleFrom(
                  backgroundColor: colorScheme.secondary,
                  foregroundColor: colorScheme.onSecondary,
                  minimumSize: const Size(double.infinity, 44),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  elevation: 0,
                ),
                child: Text(
                  AppTranslations.get(context, 'dictionary', 'learnNow'),
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatItem(BuildContext context, String label, int value) {
    final colorScheme = Theme.of(context).colorScheme;
    return Column(
      children: [
        Text(
          '$value',
          style: TextStyle(
            fontWeight: FontWeight.w800,
            fontSize: 16,
            color: colorScheme.onSurface,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 11,
            color: colorScheme.onSurfaceVariant,
          ),
        ),
      ],
    );
  }
}

class _EmptyState extends StatelessWidget {
  final bool isPickingList;

  const _EmptyState({required this.isPickingList});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Padding(
      padding: const EdgeInsets.only(top: 80),
      child: Column(
        children: [
          Icon(
            Icons.library_books_outlined,
            size: 80,
            color: colorScheme.outlineVariant,
          ),
          const SizedBox(height: 16),
          Text(
            AppTranslations.get(context, 'dictionary', 'noListsFound'),
            style: AppTextStyles.bodyLg.copyWith(
              color: colorScheme.onSurfaceVariant,
              fontWeight: FontWeight.w500,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(
            isPickingList
                ? AppTranslations.get(context, 'dictionary', 'createListToSaveWordHint')
                : AppTranslations.get(context, 'dictionary', 'saveWordToCreateFirstListHint'),
            style: AppTextStyles.bodyMd.copyWith(color: colorScheme.outline),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

class _ErrorState extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const _ErrorState({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline_rounded,
              size: 80,
              color: colorScheme.error,
            ),
            const SizedBox(height: 16),
            Text(
              AppTranslations.get(context, 'dictionary', 'errorOccurred'),
              style: AppTextStyles.bodyLg.copyWith(
                color: colorScheme.error,
                fontWeight: FontWeight.w600,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              message,
              style: AppTextStyles.bodyMd.copyWith(
                color: colorScheme.onSurfaceVariant,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: Text(AppTranslations.get(context, 'dictionary', 'retry')),
              style: ElevatedButton.styleFrom(
                backgroundColor: colorScheme.primary,
                foregroundColor: colorScheme.onPrimary,
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
}
