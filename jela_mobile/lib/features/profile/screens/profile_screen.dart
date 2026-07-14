import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../common/theme/app_colors.dart';
import '../../../common/theme/app_text_styles.dart';
import '../../../providers/auth_provider.dart';
import '../../../core/localization/app_translations.dart';
import 'profile_edit_screen.dart';
import 'settings_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  Future<void> handleLogout(BuildContext context) async {
    await context.read<AuthProvider>().logout();
  }

  String _getDisplayAuthType(BuildContext context, String? authType) {
    switch (authType?.toUpperCase()) {
      case 'GOOGLE':
        return 'Google';
      case 'LOCAL':
        return AppTranslations.get(context, 'profile', 'authEmail');
      default:
        return AppTranslations.get(context, 'profile', 'unknown');
    }
  }

  String _getDisplayStatus(BuildContext context, String? status) {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return AppTranslations.get(context, 'profile', 'statusActive');
      case 'INACTIVE':
        return AppTranslations.get(context, 'profile', 'statusInactive');
      case 'BANNED':
      case 'LOCKED':
        return AppTranslations.get(context, 'profile', 'statusBanned');
      default:
        return AppTranslations.get(context, 'profile', 'unknown');
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final user = authProvider.user;

    return Scaffold(
      appBar: AppBar(title: Text(AppTranslations.get(context, 'menu', 'profile'))),
      body: RefreshIndicator(
        onRefresh: () => context.read<AuthProvider>().refreshCurrentUser(),
        child: ListView(
          padding: const EdgeInsets.all(24),
          children: [
            if (user == null)
              const _EmptyProfile()
            else ...[
              Center(
                child: Column(
                  children: [
                    CircleAvatar(
                      radius: 50,
                      backgroundColor: AppColors.primaryContainer,
                      backgroundImage: user.avatarUrl == null
                          ? null
                          : NetworkImage(user.avatarUrl!),
                      child: user.avatarUrl == null
                          ? Text(
                              user.avatarInitial,
                              style: AppTextStyles.headlineMd.copyWith(
                                fontSize: 40,
                                color: AppColors.onPrimary,
                              ),
                            )
                          : null,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      user.fullName,
                      style: AppTextStyles.headlineMd,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      user.email,
                      style: AppTextStyles.bodyMd.copyWith(
                        color: AppColors.textSecondary,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 16),
                    Wrap(
                      alignment: WrapAlignment.center,
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        _ProfileBadge(
                          icon: Icons.school_outlined,
                          label: (user.level == null || user.level!.trim().isEmpty) 
                              ? AppTranslations.get(context, 'profile', 'levelBeginner') 
                              : user.level!.trim(),
                          color: AppColors.secondary,
                        ),
                        if (user.isAdmin)
                          const _ProfileBadge(
                            icon: Icons.admin_panel_settings_outlined,
                            label: 'Admin',
                            color: AppColors.gamification,
                          ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),
              _InfoPanel(
                children: [
                  _InfoRow(
                    icon: Icons.phone_outlined,
                    label: AppTranslations.get(context, 'profile', 'phone'),
                    value: (user.phone == null || user.phone!.trim().isEmpty) 
                        ? AppTranslations.get(context, 'profile', 'notUpdated') 
                        : user.phone!.trim(),
                  ),
                  _InfoRow(
                    icon: Icons.verified_outlined,
                    label: 'Email',
                    value: AppTranslations.get(context, 'profile', user.emailVerified ? 'verified' : 'unverified'),
                  ),
                  _InfoRow(
                    icon: Icons.login_outlined,
                    label: AppTranslations.get(context, 'profile', 'loginType'),
                    value: _getDisplayAuthType(context, user.authType),
                  ),
                  _InfoRow(
                    icon: Icons.check_circle_outline,
                    label: AppTranslations.get(context, 'profile', 'status'),
                    value: _getDisplayStatus(context, user.status),
                  ),
                  _InfoRow(
                    icon: Icons.groups_outlined,
                    label: AppTranslations.get(context, 'profile', 'role'),
                    value: user.roleText,
                  ),
                ],
              ),
            ],
            const SizedBox(height: 32),
            _ProfileMenuItem(
              icon: Icons.person_outline,
              title: AppTranslations.get(context, 'profile', 'editProfile'),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const ProfileEditScreen(),
                  ),
                );
              },
            ),
            _ProfileMenuItem(
              icon: Icons.settings_outlined,
              title: AppTranslations.get(context, 'menu', 'settings'),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const SettingsScreen(),
                  ),
                );
              },
            ),
            const SizedBox(height: 24),
            const Divider(color: AppColors.outlineVariant),
            const SizedBox(height: 24),
            _ProfileMenuItem(
              icon: Icons.logout,
              title: AppTranslations.get(context, 'menu', 'logout'),
              color: AppColors.error,
              onTap: () => handleLogout(context),
            ),
          ],
        ),
      ),
    );
  }
}

class _EmptyProfile extends StatelessWidget {
  const _EmptyProfile();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Theme.of(context).colorScheme.outlineVariant),
      ),
      child: Text(
        AppTranslations.get(context, 'profile', 'noInfo'),
        style: AppTextStyles.bodyMd.copyWith(color: Theme.of(context).colorScheme.onSurfaceVariant),
        textAlign: TextAlign.center,
      ),
    );
  }
}

class _InfoPanel extends StatelessWidget {
  final List<Widget> children;

  const _InfoPanel({required this.children});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Theme.of(context).colorScheme.outlineVariant),
      ),
      child: Column(children: children),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _InfoRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          Icon(icon, color: Theme.of(context).colorScheme.primary, size: 22),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              label,
              style: AppTextStyles.bodyMd.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Flexible(
            child: Text(
              value,
              style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.w600),
              textAlign: TextAlign.right,
            ),
          ),
        ],
      ),
    );
  }
}

class _ProfileBadge extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;

  const _ProfileBadge({
    required this.icon,
    required this.label,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: color),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: color, size: 16),
          const SizedBox(width: 6),
          Text(label, style: AppTextStyles.labelCaps.copyWith(color: color)),
        ],
      ),
    );
  }
}

class _ProfileMenuItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final VoidCallback onTap;
  final Color? color;

  const _ProfileMenuItem({
    required this.icon,
    required this.title,
    required this.onTap,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: color ?? Theme.of(context).colorScheme.primary),
      title: Text(
        title,
        style: AppTextStyles.bodyMd.copyWith(
          color: color ?? Theme.of(context).colorScheme.onSurface,
          fontWeight: FontWeight.w500,
        ),
      ),
      trailing: const Icon(Icons.chevron_right, size: 20),
      onTap: onTap,
      contentPadding: EdgeInsets.zero,
    );
  }
}
