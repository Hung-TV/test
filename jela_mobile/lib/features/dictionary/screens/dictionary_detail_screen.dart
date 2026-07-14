import 'package:flutter/material.dart';
import '../../../common/theme/app_colors.dart';
import '../../../common/theme/app_text_styles.dart';
import '../models/dictionary_detail.dart';
import '../services/dictionary_service.dart';
import 'my_dictionary_lists_screen.dart';
import '../../../core/localization/app_translations.dart';

class DictionaryDetailScreen extends StatefulWidget {
  final int id;

  const DictionaryDetailScreen({super.key, required this.id});

  @override
  State<DictionaryDetailScreen> createState() => _DictionaryDetailScreenState();
}

class _DictionaryDetailScreenState extends State<DictionaryDetailScreen> {
  final DictionaryService _dictionaryService = DictionaryService();
  bool _isLoading = true;
  DictionaryDetail? _detail;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _fetchDetail();
  }

  Future<void> _fetchDetail() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final detailData = await _dictionaryService.getDetail(widget.id);
      setState(() {
        _detail = detailData;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceFirst('Exception: ', '').trim();
        _isLoading = false;
      });
    }
  }

  Future<void> _openSaveToList() async {
    final detail = _detail;
    if (detail == null) {
      return;
    }

    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => MyDictionaryListsScreen(
          wordId: detail.id,
          wordLabel: detail.displayWord,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(AppTranslations.get(context, 'dictionary', 'wordDetails')),
        elevation: 0,
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.textPrimary,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          if (_detail != null)
            IconButton(
              tooltip: AppTranslations.get(context, 'dictionary', 'addToList'),
              onPressed: _openSaveToList,
              icon: const Icon(Icons.bookmark_add_outlined),
            ),
        ],
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(
          valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
        ),
      );
    }

    if (_errorMessage != null) {
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
                _errorMessage!,
                style: AppTextStyles.bodyMd.copyWith(
                  color: AppColors.textSecondary,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: _fetchDetail,
                icon: const Icon(Icons.refresh),
                label: Text(AppTranslations.get(context, 'dictionary', 'retry')),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
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

    final detail = _detail;
    if (detail == null) {
      return Center(child: Text(AppTranslations.get(context, 'dictionary', 'dataNotFound')));
    }

    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Word Card
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: AppColors.outlineVariant),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  detail.displayWord,
                  style: AppTextStyles.japaneseLg.copyWith(
                    color: AppColors.primary,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                if (detail.kanji != null &&
                    detail.kanji!.trim().isNotEmpty) ...[
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      const Icon(
                        Icons.volume_up_outlined,
                        color: AppColors.secondary,
                        size: 20,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        detail.displayReading,
                        style: AppTextStyles.bodyLg.copyWith(
                          color: AppColors.textSecondary,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Meanings Title
          Text(
            AppTranslations.get(context, 'dictionary', 'meaningAndExplanation'),
            style: AppTextStyles.headlineMd.copyWith(
              fontSize: 20,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(height: 12),

          if (!detail.hasMeanings)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.outlineVariant),
              ),
              child: Text(
                AppTranslations.get(context, 'dictionary', 'noDetailedMeaning'),
                style: AppTextStyles.bodyMd.copyWith(
                  color: AppColors.textSecondary,
                  fontStyle: FontStyle.italic,
                ),
              ),
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: detail.meanings.length,
              separatorBuilder: (context, index) => const SizedBox(height: 16),
              itemBuilder: (context, index) {
                final meaning = detail.meanings[index];
                return Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.outlineVariant),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Index Circle Badge
                          Container(
                            width: 24,
                            height: 24,
                            decoration: const BoxDecoration(
                              color: AppColors.primary,
                              shape: BoxShape.circle,
                            ),
                            alignment: Alignment.center,
                            child: Text(
                              '${index + 1}',
                              style: AppTextStyles.labelCaps.copyWith(
                                color: Colors.white,
                                fontSize: 10,
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                if (meaning.displayPos.isNotEmpty) ...[
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 8,
                                      vertical: 2,
                                    ),
                                    decoration: BoxDecoration(
                                      color: AppColors.secondary.withValues(
                                        alpha: 0.1,
                                      ),
                                      borderRadius: BorderRadius.circular(6),
                                      border: Border.all(
                                        color: AppColors.secondary.withValues(
                                          alpha: 0.3,
                                        ),
                                      ),
                                    ),
                                    child: Text(
                                      meaning.displayPos,
                                      style: AppTextStyles.labelCaps.copyWith(
                                        color: AppColors.secondary,
                                        fontSize: 10,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                ],
                                Text(
                                  meaning.displayGloss,
                                  style: AppTextStyles.bodyMd.copyWith(
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.textPrimary,
                                  ),
                                ),
                                if (meaning.displayXref.isNotEmpty) ...[
                                  const SizedBox(height: 6),
                                  Row(
                                    children: [
                                      const Icon(
                                        Icons.link_outlined,
                                        size: 16,
                                        color: AppColors.textMuted,
                                      ),
                                      const SizedBox(width: 4),
                                      Text(
                                        '${AppTranslations.get(context, 'dictionary', 'reference')} ${meaning.displayXref}',
                                        style: AppTextStyles.bodyMd.copyWith(
                                          color: AppColors.textMuted,
                                          fontSize: 14,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ],
                            ),
                          ),
                        ],
                      ),
                      if (meaning.examples.isNotEmpty) ...[
                        const Padding(
                          padding: EdgeInsets.symmetric(vertical: 12),
                          child: Divider(
                            color: AppColors.outlineVariant,
                            height: 1,
                          ),
                        ),
                        Text(
                          AppTranslations.get(context, 'dictionary', 'examplesLabel'),
                          style: AppTextStyles.labelCaps.copyWith(
                            color: AppColors.textMuted,
                            fontSize: 10,
                          ),
                        ),
                        const SizedBox(height: 8),
                        ...meaning.examples.map(
                          (ex) => Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Padding(
                                  padding: EdgeInsets.only(top: 4),
                                  child: Icon(
                                    Icons.circle,
                                    size: 6,
                                    color: AppColors.secondary,
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        ex.displaySentenceJP,
                                        style: AppTextStyles.japaneseMd
                                            .copyWith(
                                              fontSize: 16,
                                              color: AppColors.textPrimary,
                                            ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        ex.displaySentenceVI,
                                        style: AppTextStyles.bodyMd.copyWith(
                                          color: AppColors.textSecondary,
                                          fontStyle: FontStyle.italic,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                );
              },
            ),
        ],
      ),
    );
  }
}
