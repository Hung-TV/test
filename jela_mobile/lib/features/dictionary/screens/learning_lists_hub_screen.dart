import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../common/theme/app_text_styles.dart';
import '../providers/dictionary_list_provider.dart';
import 'my_dictionary_lists_screen.dart';
import '../../kanji/providers/kanji_list_provider.dart';
import '../../kanji/models/kanji_learning_list.dart';
import '../../kanji/screens/kanji_session_screen.dart';
import '../../../core/localization/app_translations.dart';

class LearningListsHubScreen extends StatefulWidget {
  const LearningListsHubScreen({super.key});

  @override
  State<LearningListsHubScreen> createState() => _LearningListsHubScreenState();
}

class _LearningListsHubScreenState extends State<LearningListsHubScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<DictionaryListProvider>().loadLists();
      context.read<KanjiListProvider>().loadLists();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _showCreateDialog() {
    final controller = TextEditingController();
    final colorScheme = Theme.of(context).colorScheme;
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text(_tabController.index == 0
            ? AppTranslations.get(context, 'dictionary', 'createNewVocabList')
            : AppTranslations.get(context, 'dictionary', 'createNewKanjiList')),
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
              if (_tabController.index == 0) {
                final success =
                    await context.read<DictionaryListProvider>().createList(name);
                if (!mounted) return;
                if (success) {
                  _showSnackBar(AppTranslations.get(context, 'dictionary', 'createVocabListSuccess'));
                } else {
                  _showSnackBar(AppTranslations.get(context, 'dictionary', 'createVocabListError'));
                }
              } else {
                final success =
                    await context.read<KanjiListProvider>().createList(name);
                if (!mounted) return;
                if (success) {
                  _showSnackBar(AppTranslations.get(context, 'dictionary', 'createKanjiListSuccess'));
                } else {
                  _showSnackBar(AppTranslations.get(context, 'dictionary', 'createKanjiListError'));
                }
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: colorScheme.primary,
              foregroundColor: colorScheme.onPrimary,
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

  void _showSnackBar(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(message)));
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: Text(AppTranslations.get(context, 'dictionary', 'personalStudyLists')),
        bottom: TabBar(
          controller: _tabController,
          labelColor: colorScheme.primary,
          unselectedLabelColor: colorScheme.onSurfaceVariant,
          indicatorColor: colorScheme.primary,
          indicatorWeight: 3,
          labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
          tabs: [
            Tab(text: AppTranslations.get(context, 'dictionary', 'studyVocab')),
            Tab(text: AppTranslations.get(context, 'dictionary', 'studyKanji')),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // Tab 1: Dictionary lists
          MyDictionaryListsScreen(
            wordId: null,
            wordLabel: null,
            showAppBar: false,
          ),
          // Tab 2: Kanji lists
          const KanjiListsTab(),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showCreateDialog,
        backgroundColor: colorScheme.primary,
        foregroundColor: colorScheme.onPrimary,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        child: const Icon(Icons.add),
      ),
    );
  }
}

class KanjiListsTab extends StatelessWidget {
  const KanjiListsTab({super.key});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Consumer<KanjiListProvider>(
      builder: (context, provider, child) {
        if (provider.isLoading) {
          return Center(
            child: CircularProgressIndicator(
              color: colorScheme.primary,
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
                  Icon(
                    Icons.error_outline_rounded,
                    size: 60,
                    color: colorScheme.error,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    provider.errorMessage!,
                    style: AppTextStyles.bodyMd
                        .copyWith(color: colorScheme.onSurfaceVariant),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: provider.loadLists,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: colorScheme.primary,
                      foregroundColor: colorScheme.onPrimary,
                    ),
                    child: Text(AppTranslations.get(context, 'dictionary', 'retry')),
                  ),
                ],
              ),
            ),
          );
        }

        final levels = ['N5', 'N4', 'N3', 'N2', 'N1'];
        final activeLists = provider.lists;

        return RefreshIndicator(
          onRefresh: provider.refresh,
          color: colorScheme.primary,
          child: ListView(
            physics: const AlwaysScrollableScrollPhysics(
              parent: BouncingScrollPhysics(),
            ),
            padding: const EdgeInsets.all(16),
            children: [
              if (activeLists.isEmpty) ...[
                _buildEnrollSection(context, provider, levels),
              ] else ...[
                Row(
                  children: [
                    Text(
                      AppTranslations.get(context, 'dictionary', 'jlptStudyLists'),
                      style: AppTextStyles.bodyLg.copyWith(
                        fontWeight: FontWeight.bold,
                        color: colorScheme.onSurface,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                ...activeLists.map((list) => _buildKanjiListCard(context, list)),
                const SizedBox(height: 24),
                _buildAvailableLevelsSection(context, provider, levels, activeLists),
              ],
            ],
          ),
        );
      },
    );
  }

  Widget _buildEnrollSection(
      BuildContext context, KanjiListProvider provider, List<String> levels) {
    final colorScheme = Theme.of(context).colorScheme;
    return Padding(
      padding: const EdgeInsets.only(top: 40),
      child: Column(
        children: [
          Icon(
            Icons.menu_book_outlined,
            size: 80,
            color: colorScheme.outlineVariant,
          ),
          const SizedBox(height: 16),
          Text(
            AppTranslations.get(context, 'dictionary', 'noActiveKanjiRoute'),
            style: AppTextStyles.bodyLg.copyWith(
              color: colorScheme.onSurfaceVariant,
              fontWeight: FontWeight.bold,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(
            AppTranslations.get(context, 'dictionary', 'selectJLPTLevelToStart'),
            style: TextStyle(color: colorScheme.outline),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            alignment: WrapAlignment.center,
            children: levels.map((lvl) {
              return ElevatedButton(
                onPressed: () async {
                  final success = await provider.startLevelList(lvl);
                  if (!context.mounted) return;
                  if (success) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                          content: Text(AppTranslations.get(context, 'dictionary', 'activatedKanjiRoute').replaceAll('{level}', lvl))),
                    );
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                          content: Text(provider.errorMessage ??
                              AppTranslations.get(context, 'dictionary', 'activateRouteError'))),
                    );
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: colorScheme.primary,
                  foregroundColor: colorScheme.onPrimary,
                  padding:
                      const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: Text(
                  lvl,
                  style: const TextStyle(
                      fontWeight: FontWeight.bold, fontSize: 16),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildAvailableLevelsSection(
      BuildContext context,
      KanjiListProvider provider,
      List<String> levels,
      List<KanjiLearningList> activeLists) {
    final colorScheme = Theme.of(context).colorScheme;
    final enrolledNames =
        activeLists.map((l) => l.listName.toUpperCase()).toSet();
    final remainingLevels = levels
        .where((lvl) =>
            !enrolledNames.contains('JLPT $lvl') &&
            !enrolledNames.contains(lvl))
        .toList();

    if (remainingLevels.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Divider(height: 32),
        Text(
          AppTranslations.get(context, 'dictionary', 'activateMoreJLPTLevels'),
          style: AppTextStyles.bodyLg.copyWith(
            fontWeight: FontWeight.bold,
            color: colorScheme.onSurface,
          ),
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: remainingLevels.map((lvl) {
            return OutlinedButton(
              onPressed: () async {
                final success = await provider.startLevelList(lvl);
                if (!context.mounted) return;
                if (success) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                        content:
                            Text(AppTranslations.get(context, 'dictionary', 'activatedKanjiRoute').replaceAll('{level}', lvl))),
                  );
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                        content: Text(provider.errorMessage ??
                            AppTranslations.get(context, 'dictionary', 'activateRouteError'))),
                  );
                }
              },
              style: OutlinedButton.styleFrom(
                foregroundColor: colorScheme.primary,
                side: BorderSide(color: colorScheme.primary, width: 1.5),
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              child: Text(
                lvl,
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildKanjiListCard(BuildContext context, KanjiLearningList list) {
    final colorScheme = Theme.of(context).colorScheme;
    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: BorderSide(color: colorScheme.outlineVariant),
      ),
      color: colorScheme.surface,
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              list.listName,
              style: AppTextStyles.bodyLg.copyWith(
                fontWeight: FontWeight.bold,
                color: colorScheme.primary,
                fontSize: 18,
              ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildStatItem(context, AppTranslations.get(context, 'dictionary', 'totalKanjiCount'), list.totalCount),
                _buildStatItem(context, AppTranslations.get(context, 'dictionary', 'newWords'), list.newCount),
                _buildStatItem(context, AppTranslations.get(context, 'dictionary', 'learningWords'), list.learningCount),
                _buildStatItem(context, AppTranslations.get(context, 'dictionary', 'masteredWords'), list.masteredCount),
              ],
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => KanjiSessionScreen(
                      listId: list.listId,
                      listName: list.listName,
                    ),
                  ),
                ).then((_) {
                  if (context.mounted) {
                    context.read<KanjiListProvider>().loadLists();
                  }
                });
              },
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
                AppTranslations.get(context, 'dictionary', 'studyNow'),
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
          ],
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
