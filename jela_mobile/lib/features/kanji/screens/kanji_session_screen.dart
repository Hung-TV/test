import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../common/theme/app_colors.dart';
import '../../../common/theme/app_text_styles.dart';
import '../providers/kanji_session_provider.dart';
import '../../../providers/auth_provider.dart';
import '../../../core/localization/app_translations.dart';

class KanjiSessionScreen extends StatefulWidget {
  final int listId;
  final String listName;
  final int batchSize;

  const KanjiSessionScreen({
    super.key,
    required this.listId,
    required this.listName,
    this.batchSize = 10,
  });

  @override
  State<KanjiSessionScreen> createState() => _KanjiSessionScreenState();
}

class _KanjiSessionScreenState extends State<KanjiSessionScreen> {
  bool _hasSubmittedResults = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<KanjiSessionProvider>().startLearnSession(
            widget.listId,
            batchSize: widget.batchSize,
          );
    });
  }

  Future<void> _submitAndClose() async {
    if (_hasSubmittedResults) {
      Navigator.pop(context);
      return;
    }

    final provider = context.read<KanjiSessionProvider>();
    final success = await provider.submitReviews(widget.listId);
    if (success) {
      setState(() {
        _hasSubmittedResults = true;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(AppTranslations.get(context, 'kanji', 'saveProgressSuccess'))),
        );
        Navigator.pop(context);
      }
    } else {
      if (mounted) {
        showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            title: Text(AppTranslations.get(context, 'kanji', 'saveProgressError')),
            content: Text(provider.errorMessage ?? AppTranslations.get(context, 'kanji', 'saveProgressErrorDesc')),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx),
                child: Text(AppTranslations.get(context, 'kanji', 'close')),
              ),
              ElevatedButton(
                onPressed: () {
                  Navigator.pop(ctx);
                  _submitAndClose();
                },
                child: Text(AppTranslations.get(context, 'kanji', 'tryAgain')),
              ),
            ],
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Consumer<KanjiSessionProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const CircularProgressIndicator(
                    valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    AppTranslations.get(context, 'kanji', 'loadingQuestions'),
                    style: TextStyle(
                      color: AppColors.textSecondary,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            );
          }

          if (provider.errorMessage != null && !provider.isSessionCompleted) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.error_outline_rounded,
                      size: 70,
                      color: AppColors.error,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      provider.errorMessage!,
                      style: AppTextStyles.bodyLg.copyWith(
                        color: AppColors.textPrimary,
                        fontWeight: FontWeight.w600,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton.icon(
                      onPressed: () => provider.startLearnSession(widget.listId),
                      icon: const Icon(Icons.refresh),
                      label: Text(AppTranslations.get(context, 'kanji', 'tryAgain')),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(
                            horizontal: 24, vertical: 12),
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

          if (provider.questions.isEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.school_outlined,
                      size: 80,
                      color: AppColors.outline,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      AppTranslations.get(context, 'kanji', 'noQuestions'),
                      style: AppTextStyles.bodyLg.copyWith(
                        color: AppColors.textPrimary,
                        fontWeight: FontWeight.w600,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      onPressed: () => Navigator.pop(context),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(
                            horizontal: 24, vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: Text(AppTranslations.get(context, 'kanji', 'goBack')),
                    ),
                  ],
                ),
              ),
            );
          }

          if (provider.isSessionCompleted) {
            return _buildResultsScreen(provider);
          }

          return _buildQuizScreen(provider);
        },
      ),
    );
  }

  Widget _buildQuizScreen(KanjiSessionProvider provider) {
    final question = provider.currentQuestion!;
    final totalQuestions = provider.questions.length;
    final currentIndex = provider.currentIndex;
    final progress = (currentIndex + 1) / totalQuestions;

    return SafeArea(
      child: Column(
        children: [
          // Header Bar
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.close, size: 26),
                  onPressed: () {
                    showDialog(
                      context: context,
                      builder: (ctx) => AlertDialog(
                        title: Text(AppTranslations.get(context, 'kanji', 'quitSession')),
                        content: Text(
                          AppTranslations.get(context, 'kanji', 'quitSessionDesc'),),
                        actions: [
                          TextButton(
                            onPressed: () => Navigator.pop(ctx),
                            child: Text(AppTranslations.get(context, 'kanji', 'continueStudy')),
                          ),
                          ElevatedButton(
                            onPressed: () {
                              Navigator.pop(ctx);
                              Navigator.pop(context);
                            },
                            style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.error,
                                foregroundColor: Colors.white),
                            child: Text(AppTranslations.get(context, 'kanji', 'quit')),
                          ),
                        ],
                      ),
                    );
                  },
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'TIẾN ĐỘ LUYỆN TẬP KANJI',
                            style: AppTextStyles.bodyMd.copyWith(
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                              color: AppColors.textMuted,
                              letterSpacing: 0.8,
                            ),
                          ),
                          Text(
                            'Câu ${currentIndex + 1} / $totalQuestions',
                            style: AppTextStyles.bodyMd.copyWith(
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                              color: AppColors.textMuted,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: LinearProgressIndicator(
                          value: progress,
                          minHeight: 8,
                          backgroundColor: AppColors.surfaceContainerHigh,
                          valueColor: const AlwaysStoppedAnimation<Color>(
                              AppColors.primary),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 16),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.gamification.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.local_fire_department,
                          color: AppColors.gamification, size: 16),
                      const SizedBox(width: 2),
                      Text(
                        'AI',
                        style: AppTextStyles.bodyMd.copyWith(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: AppColors.gamification,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Scrollable Quiz Body
          Expanded(
            child: SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Card(
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                      side: const BorderSide(color: AppColors.outlineVariant),
                    ),
                    color: AppColors.surface,
                    child: Padding(
                      padding: const EdgeInsets.all(24.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            question.questionType.replaceAll('_', ' ').toUpperCase(),
                            style: AppTextStyles.bodyMd.copyWith(
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                              color: AppColors.primary,
                              letterSpacing: 0.8,
                            ),
                          ),
                          const SizedBox(height: 12),
                          Text(
                            question.questionText,
                            style: AppTextStyles.bodyLg.copyWith(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: AppColors.textPrimary,
                              height: 1.4,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Option buttons
                  ...List.generate(question.options.length, (idx) {
                    final option = question.options[idx];
                    final isSelected = provider.selectedOptionIndex == idx;
                    final hasSelected = provider.selectedOptionIndex != null;
                    final isCorrect = idx == question.correctIndex;

                    Color bgColor = AppColors.surface;
                    Color borderColor = AppColors.outlineVariant;
                    Color textColor = AppColors.textPrimary;
                    Widget? suffixIcon;

                    if (hasSelected) {
                      if (isCorrect) {
                        bgColor = const Color(0xFFE8F5E9);
                        borderColor = const Color(0xFF2E7D32);
                        textColor = const Color(0xFF1B5E20);
                        suffixIcon = const Icon(Icons.check,
                            color: Color(0xFF2E7D32), size: 20);
                      } else if (isSelected) {
                        bgColor = const Color(0xFFFFEBEE);
                        borderColor = const Color(0xFFC62828);
                        textColor = const Color(0xFFB71C1C);
                        suffixIcon = const Icon(Icons.close,
                            color: Color(0xFFC62828), size: 20);
                      } else {
                        bgColor = AppColors.surfaceContainer;
                        borderColor = AppColors.outlineVariant;
                        textColor = AppColors.textMuted;
                      }
                    }

                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12.0),
                      child: OutlinedButton(
                        onPressed: hasSelected
                            ? null
                            : () => provider.selectOption(idx),
                        style: OutlinedButton.styleFrom(
                          backgroundColor: bgColor,
                          foregroundColor: textColor,
                          side: BorderSide(color: borderColor, width: 2),
                          padding: const EdgeInsets.symmetric(
                              horizontal: 20, vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(
                                option,
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            ?suffixIcon,
                          ],
                        ),
                      ),
                    );
                  }),

                  // AI Explanation box
                  if (provider.selectedOptionIndex != null) ...[
                    const SizedBox(height: 16),
                    _buildAIExplanationWidget(provider),
                  ],
                ],
              ),
            ),
          ),

          // Footer action button
          if (provider.selectedOptionIndex != null)
            Container(
              padding: const EdgeInsets.all(20),
              decoration: const BoxDecoration(
                color: AppColors.surface,
                border: Border(
                  top: BorderSide(color: AppColors.outlineVariant),
                ),
              ),
              child: SafeArea(
                top: false,
                child: ElevatedButton.icon(
                  onPressed: provider.nextQuestion,
                  icon: Text(
                    AppTranslations.get(context, 'kanji', 'yourAnswer'),
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  label: const Icon(Icons.arrow_forward),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildAIExplanationWidget(KanjiSessionProvider provider) {
    final isWrong = provider.selectedOptionIndex != provider.currentQuestion?.correctIndex;

    if (isWrong && provider.explanation == null && provider.explainError == null && !provider.isExplaining) {
      return Center(
        child: Container(
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [AppColors.primary, AppColors.secondary],
            ),
            borderRadius: BorderRadius.circular(12),
          ),
          child: ElevatedButton.icon(
            onPressed: provider.fetchExplanation,
            icon: const Icon(Icons.auto_awesome, size: 16, color: Colors.white),
            label: Text(AppTranslations.get(context, 'kanji', 'viewAiExplanation'),
                style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.transparent,
              shadowColor: Colors.transparent,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.primary.withValues(alpha: 0.03),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: AppColors.primary.withValues(alpha: 0.3),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppColors.primary, AppColors.secondary],
                  ),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.auto_awesome, color: Colors.white, size: 12),
                    SizedBox(width: 4),
                    Text(
                      'JELA AI',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (provider.isExplaining)
            Row(
              children: [
                const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
                  ),
                ),
                const SizedBox(width: 10),
                Text(AppTranslations.get(context, 'kanji', 'connectingAi')),
              ],
            )
          else if (provider.explainError != null)
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Lỗi tải giải thích: ${provider.explainError}',
                  style: const TextStyle(color: AppColors.error),
                ),
                const SizedBox(height: 8),
                TextButton.icon(
                  onPressed: provider.fetchExplanation,
                  icon: const Icon(Icons.refresh, size: 16),
                  label: Text(AppTranslations.get(context, 'kanji', 'tryAgain')),
                ),
              ],
            )
          else if (provider.explanation != null)
            Text(
              provider.explanation!,
              style: const TextStyle(fontSize: 14, height: 1.5),
            ),
        ],
      ),
    );
  }

  Widget _buildResultsScreen(KanjiSessionProvider provider) {
    final reviews = provider.calculateQualityReviews();
    final authProvider = context.read<AuthProvider>();
    final streak = authProvider.user?.streakCount ?? 0;

    return SafeArea(
      child: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const SizedBox(height: 24),
                  Center(
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: const BoxDecoration(
                        color: Color(0xFFE8F5E9),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.check_circle_outline,
                        color: Color(0xFF2E7D32),
                        size: 64,
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  Text(
                    'Kết quả buổi học',
                    style: AppTextStyles.bodyLg.copyWith(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Danh sách: ${widget.listName}',
                    style: AppTextStyles.bodyMd.copyWith(
                      color: AppColors.textSecondary,
                      fontWeight: FontWeight.w500,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 24),

                  // Results Grid
                  Row(
                    children: [
                      Expanded(
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          decoration: BoxDecoration(
                            color: AppColors.surface,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: AppColors.outlineVariant),
                          ),
                          child: Column(
                            children: [
                              Text(
                                '${provider.accuracyRate}%',
                                style: AppTextStyles.bodyLg.copyWith(
                                  fontSize: 28,
                                  fontWeight: FontWeight.w900,
                                  color: AppColors.primary,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                AppTranslations.get(context, 'kanji', 'onyomi'),
                                style: AppTextStyles.bodyMd.copyWith(
                                  fontSize: 12,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          decoration: BoxDecoration(
                            color: AppColors.surface,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: AppColors.outlineVariant),
                          ),
                          child: Column(
                            children: [
                              Text(
                                AppTranslations.get(context, 'kanji', 'correct').replaceAll('{correct}', '${provider.correctAnswersCount}').replaceAll('{total}', '${provider.totalAnswersCount}'),
                                style: AppTextStyles.bodyLg.copyWith(
                                  fontSize: 28,
                                  fontWeight: FontWeight.w900,
                                  color: AppColors.primary,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                AppTranslations.get(context, 'kanji', 'correctAnswer'),
                                style: AppTextStyles.bodyMd.copyWith(
                                  fontSize: 12,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Streak row
                  if (streak > 0)
                    Container(
                      padding: const EdgeInsets.symmetric(
                          vertical: 14, horizontal: 16),
                      decoration: BoxDecoration(
                        color: AppColors.gamification.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.local_fire_department,
                              color: AppColors.gamification, size: 20),
                          const SizedBox(width: 8),
                          Text(
                            'Chuỗi học tập: $streak ngày liên tiếp',
                            style: AppTextStyles.bodyMd.copyWith(
                              fontWeight: FontWeight.bold,
                              color: AppColors.gamification,
                            ),
                          ),
                        ],
                      ),
                    ),
                  const SizedBox(height: 24),

                  Text(
                    'Đánh giá Ebbinghaus theo chữ Hán:',
                    style: AppTextStyles.bodyMd.copyWith(
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 10),

                  // Kanji quality list
                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: reviews.length,
                    itemBuilder: (context, index) {
                      final item = reviews[index];
                      final quality = item['quality'] as int;

                      String badgeText = 'Thuộc tốt';
                      Color badgeBg = const Color(0xFFE8F5E9);
                      Color badgeFg = const Color(0xFF2E7D32);

                      if (quality == 2) {
                        badgeText = 'Khó';
                        badgeBg = const Color(0xFFFFF3E0);
                        badgeFg = AppColors.gamification;
                      } else if (quality == 1) {
                        badgeText = 'Học lại';
                        badgeBg = const Color(0xFFFFEBEE);
                        badgeFg = AppColors.error;
                      }

                      return Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 12),
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.outlineVariant),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    item['character']?.toString() ?? '',
                                    style: AppTextStyles.japaneseMd.copyWith(
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.textPrimary,
                                      fontSize: 16,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    'Đúng ${item['correctCount']}/${item['totalCount']}',
                                    style: const TextStyle(
                                      color: AppColors.textSecondary,
                                      fontSize: 12,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 10, vertical: 6),
                              decoration: BoxDecoration(
                                color: badgeBg,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                badgeText,
                                style: TextStyle(
                                  color: badgeFg,
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
          ),

          // Footer action button (Save / Finish)
          Container(
            padding: const EdgeInsets.all(20),
            decoration: const BoxDecoration(
              color: AppColors.surface,
              border: Border(
                top: BorderSide(color: AppColors.outlineVariant),
              ),
            ),
            child: SafeArea(
              top: false,
              child: ElevatedButton(
                onPressed: provider.isSubmitting ? null : _submitAndClose,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                child: Center(
                  child: provider.isSubmitting
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2.5,
                            valueColor:
                                AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        )
                      : Text(
                          AppTranslations.get(context, 'kanji', 'sessionComplete'),
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
