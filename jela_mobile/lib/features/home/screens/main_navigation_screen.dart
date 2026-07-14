import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../dictionary/screens/dictionary_screen.dart';
import '../../dictionary/screens/learning_lists_hub_screen.dart';
import '../../kanji/screens/kanji_screen.dart';
import '../../profile/screens/profile_screen.dart';
import '../../../common/theme/app_colors.dart';
import '../../../common/theme/app_text_styles.dart';
import '../../../core/localization/app_translations.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/preferences_provider.dart';

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int currentIndex = 0;

  void _onTabSelected(int index) {
    setState(() {
      currentIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    // Theo dõi sự thay đổi của PreferencesProvider (ngôn ngữ, giao diện) để rebuild toàn bộ UI
    context.watch<PreferencesProvider>();

    final screens = [
      HomeTab(onTabSelected: _onTabSelected),
      DictionaryScreen(),
      KanjiScreen(),
      LearningListsHubScreen(),
      ProfileScreen(),
    ];

    return Scaffold(
      body: IndexedStack(index: currentIndex, children: screens),

      bottomNavigationBar: NavigationBar(
        selectedIndex: currentIndex,
        onDestinationSelected: _onTabSelected,
        destinations: [
          NavigationDestination(
            icon: const Icon(Icons.home_outlined),
            selectedIcon: const Icon(Icons.home),
            label: AppTranslations.get(context, 'menu', 'home'),
          ),
          NavigationDestination(
            icon: const Icon(Icons.search_outlined),
            selectedIcon: const Icon(Icons.search),
            label: AppTranslations.get(context, 'menu', 'dictionary'),
          ),
          NavigationDestination(
            icon: const Icon(Icons.menu_book_outlined),
            selectedIcon: const Icon(Icons.menu_book),
            label: AppTranslations.get(context, 'menu', 'kanji'),
          ),
          NavigationDestination(
            icon: const Icon(Icons.collections_bookmark_outlined),
            selectedIcon: const Icon(Icons.collections_bookmark),
            label: AppTranslations.get(context, 'menu', 'learningLists'),
          ),
          NavigationDestination(
            icon: const Icon(Icons.person_outline),
            selectedIcon: const Icon(Icons.person),
            label: AppTranslations.get(context, 'menu', 'profile'),
          ),
        ],
      ),
    );
  }
}

class HomeTab extends StatelessWidget {
  final Function(int) onTabSelected;

  const HomeTab({super.key, required this.onTabSelected});

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    // Lấy colorScheme động theo theme hiện tại (sáng/tối)
    final colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Profile Header
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: colorScheme.surface, // FIX: Đổi theo theme
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: colorScheme.outlineVariant), // FIX: Đổi theo theme
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 28,
                        backgroundColor: colorScheme.primaryContainer,
                        child: Text(
                          authProvider.fullName
                              ?.substring(0, 1)
                              .toUpperCase() ??
                              'U',
                          style: AppTextStyles.headlineMd.copyWith(
                            color: colorScheme.onPrimaryContainer, // FIX màu chữ Avatar
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              authProvider.fullName ?? AppTranslations.get(context, 'menu', 'user'),
                              style: AppTextStyles.headlineMd.copyWith(
                                color: colorScheme.onSurface, // FIX màu chữ tên
                              ),
                            ),
                            Text(
                              '${AppTranslations.get(context, 'profile', 'jlptLevel')}: ${authProvider.level ?? "N5"}',
                              style: AppTextStyles.bodyMd.copyWith(
                                color: colorScheme.onSurfaceVariant, // FIX màu chữ cấp độ
                              ),
                            ),
                          ],
                        ),
                      ),
                      // Streak Counter (Giữ màu cam/vàng vì là màu nổi bật gamification)
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.gamification.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: AppColors.gamification),
                        ),
                        child: Row(
                          children: [
                            const Icon(
                              Icons.local_fire_department,
                              color: AppColors.gamification,
                              size: 18,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              '${authProvider.user?.streakCount ?? 0}',
                              style: AppTextStyles.labelCaps.copyWith(
                                color: AppColors.gamification,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  // const SizedBox(height: 20),
                  // Progress Bar
                  // Column(
                  //   crossAxisAlignment: CrossAxisAlignment.start,
                  //   children: [
                  //     Row(
                  //       mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  //       children: [
                  //         Text(
                  //           'Tiến độ học tập',
                  //           style: AppTextStyles.labelCaps.copyWith(
                  //             color: colorScheme.onSurfaceVariant, // FIX màu chữ
                  //           ),
                  //         ),
                  //         Text(
                  //           '65%',
                  //           style: AppTextStyles.labelCaps.copyWith(
                  //             color: colorScheme.secondary,
                  //           ),
                  //         ),
                  //       ],
                  //     ),
                  //     const SizedBox(height: 8),
                  //     ClipRRect(
                  //       borderRadius: BorderRadius.circular(10),
                  //       child: LinearProgressIndicator(
                  //         value: 0.65,
                  //         minHeight: 8,
                  //         backgroundColor: colorScheme.outlineVariant.withValues(alpha: 0.3), // FIX màu nền thanh quá trình
                  //         valueColor: AlwaysStoppedAnimation<Color>(
                  //           colorScheme.secondary,
                  //         ),
                  //       ),
                  //     ),
                  //   ],
                  // ),
                ],
              ),
            ),

            const SizedBox(height: 32),

            Text(
              AppTranslations.get(context, 'menu', 'whatToLearnToday'),
              style: AppTextStyles.headlineMd.copyWith(
                color: colorScheme.primary, // FIX màu chữ tiêu đề
              ),
            ),
            const SizedBox(height: 16),

            // Learning Cards Grid or List
            _LearningCard(
              title: AppTranslations.get(context, 'menu', 'dictionary'),
              subtitle: AppTranslations.get(context, 'menu', 'dictDesc'),
              icon: Icons.search,
              onTap: () => onTabSelected(1),
            ),
            const SizedBox(height: 12),
            _LearningCard(
              title: AppTranslations.get(context, 'menu', 'kanji'),
              subtitle: AppTranslations.get(context, 'menu', 'kanjiDesc'),
              icon: Icons.menu_book,
              onTap: () => onTabSelected(2),
            ),
            const SizedBox(height: 12),
            _LearningCard(
              title: AppTranslations.get(context, 'menu', 'vocab'),
              subtitle: AppTranslations.get(context, 'menu', 'vocabDesc'),
              icon: Icons.style,
              onTap: () => onTabSelected(3),
            ),
            // const SizedBox(height: 12),
            // _LearningCard(
            //   title: AppTranslations.get(context, 'menu', 'grammar'),
            //   subtitle: AppTranslations.get(context, 'menu', 'grammarDesc'),
            //   icon: Icons.architecture,
            //   onTap: () {},
            // ),
          ],
        ),
      ),
    );
  }
}

class _LearningCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final VoidCallback onTap;

  const _LearningCard({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme; // Lấy theme động

    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: colorScheme.primary.withValues(alpha: 0.05), // FIX màu nền icon
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: colorScheme.primary),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: AppTextStyles.bodyLg.copyWith(
                        fontWeight: FontWeight.w600,
                        color: colorScheme.onSurface, // FIX màu chữ tiêu đề Card
                      ),
                    ),
                    Text(
                      subtitle,
                      style: AppTextStyles.bodyMd.copyWith(
                        color: colorScheme.onSurfaceVariant, // FIX màu mô tả Card
                      ),
                    ),
                  ],
                ),
              ),
              Icon(Icons.chevron_right, color: colorScheme.outline),
            ],
          ),
        ),
      ),
    );
  }
}