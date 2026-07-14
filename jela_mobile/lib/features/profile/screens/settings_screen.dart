import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../common/theme/app_text_styles.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/preferences_provider.dart';
import '../../../core/localization/app_translations.dart';

/// Màn hình Cài đặt hệ thống di động (SettingsScreen)
/// Đồng bộ hoàn toàn nghiệp vụ đổi mật khẩu, quản lý email (sửa/xác thực), Dark Mode,
/// đa ngôn ngữ Anh-Việt, cấu hình thông báo tương tự bản Web.
class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  /// Gửi email xác thực tài khoản
  Future<void> _handleVerifyEmail() async {
    final authProvider = context.read<AuthProvider>();
    final messages = AppTranslations.getSection(context, 'settings');

    final success = await authProvider.sendEmailVerification();
    if (mounted) {
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(messages['verificationSent']!),
            backgroundColor: Theme.of(context).colorScheme.primary,
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(authProvider.errorMessage ?? 'Không thể gửi email xác minh.'),
            backgroundColor: Theme.of(context).colorScheme.error,
          ),
        );
      }
    }
  }

  /// Mở hộp thoại thay đổi email
  void _showEditEmailDialog() {
    final authProvider = context.read<AuthProvider>();
    final isEn = Provider.of<PreferencesProvider>(context, listen: false).locale.languageCode == 'en';
    final messages = AppTranslations.getSection(context, 'settings');
    
    final emailController = TextEditingController(text: authProvider.user?.email);
    final formKey = GlobalKey<FormState>();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(messages['editEmail']!),
        content: Form(
          key: formKey,
          child: TextFormField(
            controller: emailController,
            decoration: InputDecoration(
              labelText: messages['newEmailLabel'],
              prefixIcon: const Icon(Icons.email_outlined),
            ),
            keyboardType: TextInputType.emailAddress,
            validator: (value) {
              if (value == null || value.trim().isEmpty) {
                return isEn ? 'Please enter email' : 'Vui lòng nhập email';
              }
              if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value.trim())) {
                return isEn ? 'Invalid email format' : 'Email không đúng định dạng';
              }
              return null;
            },
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(messages['cancel']!),
          ),
          ElevatedButton(
            onPressed: () async {
              if (!formKey.currentState!.validate()) return;
              final newEmail = emailController.text.trim();
              Navigator.pop(context); // Đóng dialog nhập

              final messenger = ScaffoldMessenger.of(this.context);
              final success = await authProvider.updateEmail(newEmail);
              if (mounted) {
                if (success) {
                  messenger.showSnackBar(
                    SnackBar(
                      content: Text(messages['saveSuccess']!),
                      backgroundColor: Theme.of(this.context).colorScheme.primary,
                    ),
                  );
                } else {
                  messenger.showSnackBar(
                    SnackBar(
                      content: Text(authProvider.errorMessage ?? 'Không thể cập nhật email.'),
                      backgroundColor: Theme.of(this.context).colorScheme.error,
                    ),
                  );
                }
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: Theme.of(context).colorScheme.primary),
            child: Text(messages['confirm']!, style: const TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  /// Mở hộp thoại Đổi mật khẩu
  void _showChangePasswordDialog() {
    final isEn = Provider.of<PreferencesProvider>(context, listen: false).locale.languageCode == 'en';
    final messages = AppTranslations.getSection(context, 'settings');
    
    final currentPasswordController = TextEditingController();
    final newPasswordController = TextEditingController();
    final confirmPasswordController = TextEditingController();
    final formKey = GlobalKey<FormState>();

    showDialog(
      context: context,
      builder: (context) {
        bool obscureCurrent = true;
        bool obscureNew = true;
        bool obscureConfirm = true;

        return StatefulBuilder(
          builder: (context, setStateDialog) {
            return AlertDialog(
              title: Text(messages['changePassword']!),
              content: Form(
                key: formKey,
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Hướng dẫn đặt mật khẩu cho người dùng
                      Container(
                        padding: const EdgeInsets.all(12),
                        margin: const EdgeInsets.only(bottom: 16),
                        decoration: BoxDecoration(
                          color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.2)),
                        ),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Icon(Icons.info_outline, size: 16, color: Theme.of(context).colorScheme.primary),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                isEn 
                                  ? 'Password must be at least 6 characters, including both letters and numbers for safety.'
                                  : 'Mật khẩu phải dài ít nhất 6 ký tự, chứa cả chữ cái và chữ số để tăng tính bảo mật.',
                                style: const TextStyle(fontSize: 12, height: 1.4),
                              ),
                            ),
                          ],
                        ),
                      ),
                      
                      TextFormField(
                        controller: currentPasswordController,
                        decoration: InputDecoration(
                          labelText: messages['currentPassword'],
                          suffixIcon: IconButton(
                            icon: Icon(obscureCurrent ? Icons.visibility : Icons.visibility_off),
                            onPressed: () {
                              setStateDialog(() {
                                obscureCurrent = !obscureCurrent;
                              });
                            },
                          ),
                        ),
                        obscureText: obscureCurrent,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return isEn ? 'Please enter current password' : 'Vui lòng nhập mật khẩu hiện tại';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: newPasswordController,
                        decoration: InputDecoration(
                          labelText: messages['newPassword'],
                          suffixIcon: IconButton(
                            icon: Icon(obscureNew ? Icons.visibility : Icons.visibility_off),
                            onPressed: () {
                              setStateDialog(() {
                                obscureNew = !obscureNew;
                              });
                            },
                          ),
                        ),
                        obscureText: obscureNew,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return isEn ? 'Please enter new password' : 'Vui lòng nhập mật khẩu mới';
                          }
                          if (value.length < 6) {
                            return isEn ? 'Password must be at least 6 characters' : 'Mật khẩu phải từ 6 ký tự trở lên';
                          }
                          // Yêu cầu chứa cả chữ và số
                          if (!RegExp(r'^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d\W_]{6,}$').hasMatch(value)) {
                            return isEn 
                              ? 'Must contain both letters and numbers' 
                              : 'Mật khẩu phải bao gồm cả chữ và số';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: confirmPasswordController,
                        decoration: InputDecoration(
                          labelText: messages['confirmNewPassword'],
                          suffixIcon: IconButton(
                            icon: Icon(obscureConfirm ? Icons.visibility : Icons.visibility_off),
                            onPressed: () {
                              setStateDialog(() {
                                obscureConfirm = !obscureConfirm;
                              });
                            },
                          ),
                        ),
                        obscureText: obscureConfirm,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return isEn ? 'Please confirm new password' : 'Vui lòng xác nhận mật khẩu mới';
                          }
                          if (value != newPasswordController.text) {
                            return isEn ? 'Passwords do not match' : 'Mật khẩu xác nhận không trùng khớp';
                          }
                          return null;
                        },
                      ),
                    ],
                  ),
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: Text(messages['cancel']!),
                ),
                ElevatedButton(
                  onPressed: () async {
                    if (!formKey.currentState!.validate()) return;
                    
                    final currentPassword = currentPasswordController.text;
                    final newPassword = newPasswordController.text;
                    final confirmPassword = confirmPasswordController.text;
                    Navigator.pop(context); // Đóng dialog

                    final authProvider = context.read<AuthProvider>();
                    final messenger = ScaffoldMessenger.of(this.context);
                    
                    final success = await authProvider.changePassword(
                      currentPassword: currentPassword,
                      newPassword: newPassword,
                      confirmPassword: confirmPassword,
                    );

                    if (mounted) {
                      if (success) {
                        messenger.showSnackBar(
                          SnackBar(
                            content: Text(messages['passwordChanged'] ?? 'Đổi mật khẩu thành công!'),
                            backgroundColor: Theme.of(this.context).colorScheme.primary,
                          ),
                        );
                      } else {
                        messenger.showSnackBar(
                          SnackBar(
                            content: Text(authProvider.errorMessage ?? 'Không thể đổi mật khẩu.'),
                            backgroundColor: Theme.of(this.context).colorScheme.error,
                          ),
                        );
                      }
                    }
                  },
                  style: ElevatedButton.styleFrom(backgroundColor: Theme.of(context).colorScheme.primary),
                  child: Text(messages['confirm']!, style: const TextStyle(color: Colors.white)),
                ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final prefs = context.watch<PreferencesProvider>();
    final user = authProvider.user;

    final lang = prefs.locale.languageCode;
    final messages = AppTranslations.getSection(context, 'settings');

    // Kiểm tra loại tài khoản của người dùng (Google vs cục bộ) giống bản Web
    final provider = (user?.authType ?? '').toLowerCase();
    final isGoogleAccount = provider.contains('google') ||
        (user?.avatarUrl ?? '').contains('googleusercontent.com');

    // Email đã được xác minh chưa
    final isEmailVerified = user?.emailVerified ?? false;

    return Scaffold(
      appBar: AppBar(
        title: Text(messages['title']!),
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          // ================= PHẦN 1: TÀI KHOẢN & BẢO MẬT =================
          _buildSectionHeader(messages['accountSecurity']!),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            messages['emailStatus']!,
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                          ),
                          const SizedBox(height: 4),
                          Text(user?.email ?? '', style: TextStyle(color: Theme.of(context).hintColor)),
                        ],
                      ),
                      // Badge trạng thái xác thực
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: isEmailVerified
                              ? Colors.green.withValues(alpha: 0.15)
                              : Colors.orange.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          isEmailVerified ? messages['verified']! : messages['unverified']!,
                          style: TextStyle(
                            color: isEmailVerified ? Colors.green : Colors.orange,
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      // Nút xác minh email (chỉ hiện khi chưa xác thực)
                      if (!isEmailVerified)
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: authProvider.isLoading ? null : _handleVerifyEmail,
                            icon: const Icon(Icons.verified_user_outlined, size: 18),
                            label: Text(messages['verifyNow']!),
                            style: OutlinedButton.styleFrom(
                              side: BorderSide(color: Theme.of(context).colorScheme.primary),
                              foregroundColor: Theme.of(context).colorScheme.primary,
                            ),
                          ),
                        ),
                      if (!isEmailVerified) const SizedBox(width: 12),
                      
                      // Nút Chỉnh sửa email (Luôn cho phép với tài khoản cục bộ)
                      if (!isGoogleAccount)
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: _showEditEmailDialog,
                            icon: const Icon(Icons.edit_outlined, size: 18),
                            label: Text(messages['editEmail']!),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Theme.of(context).colorScheme.primary,
                              foregroundColor: Colors.white,
                            ),
                          ),
                        ),
                    ],
                  ),
                  
                  const Divider(height: 32),

                  // Nút đổi mật khẩu hoặc mẹo tài khoản Google
                  if (isGoogleAccount)
                    Text(
                      messages['googleAccountTip']!,
                      style: TextStyle(
                        fontStyle: FontStyle.italic,
                        fontSize: 13,
                        color: Theme.of(context).hintColor,
                      ),
                    )
                  else
                    ListTile(
                      leading: Icon(Icons.lock_outline, color: Theme.of(context).colorScheme.primary),
                      title: Text(
                        messages['changePassword']!,
                        style: const TextStyle(fontWeight: FontWeight.w500),
                      ),
                      trailing: const Icon(Icons.chevron_right, size: 20),
                      contentPadding: EdgeInsets.zero,
                      onTap: _showChangePasswordDialog,
                    ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),

          // ================= PHẦN 2: TÙY CHỌN HỆ THỐNG =================
          _buildSectionHeader(messages['preferences']!),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  // Nút chuyển chế độ Tối / Sáng
                  SwitchListTile(
                    title: Text(messages['darkMode']!),
                    value: prefs.isDarkMode,
                    activeThumbColor: Theme.of(context).colorScheme.secondary,
                    onChanged: (value) => prefs.toggleTheme(value),
                    secondary: Icon(Icons.dark_mode_outlined, color: Theme.of(context).colorScheme.primary),
                    contentPadding: EdgeInsets.zero,
                  ),
                  const Divider(),
                  
                  // Chuyển đổi ngôn ngữ hiển thị
                  ListTile(
                    leading: Icon(Icons.language, color: Theme.of(context).colorScheme.primary),
                    title: Text(messages['language']!),
                    contentPadding: EdgeInsets.zero,
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        ChoiceChip(
                          label: const Text('VI', style: TextStyle(fontWeight: FontWeight.bold)),
                          selected: lang == 'vi',
                          selectedColor: Theme.of(context).colorScheme.primary,
                          checkmarkColor: Colors.white,
                          labelStyle: TextStyle(color: lang == 'vi' ? Colors.white : Theme.of(context).colorScheme.primary),
                          onSelected: (selected) {
                            if (selected) prefs.setLanguage('vi');
                          },
                        ),
                        const SizedBox(width: 8),
                        ChoiceChip(
                          label: const Text('EN', style: TextStyle(fontWeight: FontWeight.bold)),
                          selected: lang == 'en',
                          selectedColor: Theme.of(context).colorScheme.primary,
                          checkmarkColor: Colors.white,
                          labelStyle: TextStyle(color: lang == 'en' ? Colors.white : Theme.of(context).colorScheme.primary),
                          onSelected: (selected) {
                            if (selected) prefs.setLanguage('en');
                          },
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),

          // ================= PHẦN 3: CÀI ĐẶT THÔNG BÁO =================
          _buildSectionHeader(messages['notifSettings']!),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  // Toggle bật tắt thông báo Email
                  SwitchListTile(
                    title: Text(messages['emailNotif']!),
                    value: prefs.emailNotifications,
                    activeThumbColor: Theme.of(context).colorScheme.secondary,
                    onChanged: (value) => prefs.setEmailNotifications(value),
                    secondary: Icon(Icons.mail_outline, color: Theme.of(context).colorScheme.primary),
                    contentPadding: EdgeInsets.zero,
                  ),
                  const Divider(),
                  
                  // Toggle nhắc nhở học tập (Streak)
                  SwitchListTile(
                    title: Text(messages['streakNotif']!),
                    value: prefs.streakReminders,
                    activeThumbColor: Theme.of(context).colorScheme.secondary,
                    onChanged: (value) => prefs.setStreakReminders(value),
                    secondary: Icon(Icons.notifications_active_outlined, color: Theme.of(context).colorScheme.primary),
                    contentPadding: EdgeInsets.zero,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  /// Helper dựng tiêu đề cho các phân vùng cài đặt
  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 8),
      child: Text(
        title.toUpperCase(),
        style: AppTextStyles.labelCaps.copyWith(
          color: Theme.of(context).colorScheme.outline,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}
