import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';

import '../../../common/theme/app_text_styles.dart';
import '../../../providers/auth_provider.dart';
import '../../../core/localization/app_translations.dart';
import '../../../common/theme/app_colors.dart';

/// Màn hình chỉnh sửa thông tin cá nhân người dùng
/// Hỗ trợ đầy đủ: đa ngôn ngữ Anh-Việt, Dark Mode, tải ảnh cá nhân và chọn ảnh mẫu
class ProfileEditScreen extends StatefulWidget {
  const ProfileEditScreen({super.key});

  @override
  State<ProfileEditScreen> createState() => _ProfileEditScreenState();
}

class _ProfileEditScreenState extends State<ProfileEditScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _fullNameController;
  late TextEditingController _phoneController;
  late TextEditingController _avatarUrlController;
  late String _originalLevel;
  String _selectedLevel = 'N5';

  final List<String> _levels = const ['N5', 'N4', 'N3', 'N2', 'N1'];

  // Danh sách các avatar mẫu DiceBear được cấu hình sẵn giống phiên bản Web
  final List<Map<String, String>> _presetAvatars = const [
    {
      'name': 'Robohash 1',
      'url': 'https://api.dicebear.com/7.x/bottts/svg?seed=Jela1',
    },
    {
      'name': 'Robohash 2',
      'url': 'https://api.dicebear.com/7.x/bottts/svg?seed=Jela2',
    },
    {
      'name': 'Lorelei 1',
      'url': 'https://api.dicebear.com/7.x/lorelei/svg?seed=Jela3',
    },
    {
      'name': 'Lorelei 2',
      'url': 'https://api.dicebear.com/7.x/lorelei/svg?seed=Jela4',
    },
    {
      'name': 'Adventurer 1',
      'url': 'https://api.dicebear.com/7.x/adventurer/svg?seed=Jela5',
    },
    {
      'name': 'Adventurer 2',
      'url': 'https://api.dicebear.com/7.x/adventurer/svg?seed=Jela6',
    },
  ];

  @override
  void initState() {
    super.initState();
    final user = context.read<AuthProvider>().user;
    _fullNameController = TextEditingController(text: user?.fullName ?? '');
    _phoneController = TextEditingController(text: user?.phone ?? '');
    _avatarUrlController = TextEditingController(text: user?.avatarUrl ?? '');
    _originalLevel = user?.level ?? 'N5';
    _selectedLevel = _originalLevel;
  }

  @override
  void dispose() {
    _fullNameController.dispose();
    _phoneController.dispose();
    _avatarUrlController.dispose();
    super.dispose();
  }

  /// Chuẩn hóa số điện thoại: Loại bỏ các khoảng trắng và ký tự đặc biệt thừa
  String _normalizePhone(String phone) {
    return phone.replaceAll(RegExp(r'[\s\-\(\)]'), '');
  }

  /// Thực hiện chọn ảnh từ thư viện thiết bị (Tăng trải nghiệm UX)
  Future<void> _pickLocalImage() async {
    try {
      final ImagePicker picker = ImagePicker();
      final XFile? image = await picker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 512,
        maxHeight: 512,
        imageQuality: 80,
      );

      if (image != null) {
        final List<int> bytes = await image.readAsBytes();
        final String base64Image = base64Encode(bytes);
        final String mimeType = image.mimeType ?? 'image/png';
        
        setState(() {
          _avatarUrlController.text = 'data:$mimeType;base64,$base64Image';
        });

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(AppTranslations.get(context, 'profile', 'personalPhotoSuccess')),
              backgroundColor: Theme.of(context).colorScheme.primary,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Không thể chọn ảnh: $e'),
            backgroundColor: Theme.of(context).colorScheme.error,
          ),
        );
      }
    }
  }

  /// Helper giải mã an toàn ảnh từ chuỗi Base64 Data URL hoặc link Network URL
  ImageProvider? _getAvatarImage(String url) {
    if (url.isEmpty) return null;
    if (url.startsWith('data:image')) {
      try {
        final base64String = url.split(',').last;
        return MemoryImage(base64Decode(base64String));
      } catch (_) {
        return null;
      }
    }
    return NetworkImage(url);
  }

  String? _validateFullName(String? value) {
    if (value == null || value.trim().isEmpty) {
      return AppTranslations.get(context, 'profile', 'invalidName');
    }
    return null;
  }

  String? _validatePhone(String? value) {
    if (value == null || value.trim().isEmpty) {
      return null;
    }
    final normalized = _normalizePhone(value);
    if (!RegExp(r'^(?:\+84|0)(?:3|5|7|8|9)\d{8}$').hasMatch(normalized)) {
      return AppTranslations.get(context, 'profile', 'invalidPhone');
    }
    return null;
  }

  /// Thực hiện kiểm tra và gửi cập nhật
  Future<void> _submitForm() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    // Nếu trình độ thay đổi, hiển thị Pop-up xác nhận do ảnh hưởng đến lộ trình học
    if (_selectedLevel != _originalLevel) {
      final confirm = await showDialog<bool>(
        context: context,
        builder: (context) => AlertDialog(
          title: Text(AppTranslations.get(context, 'profile', 'originalLevelWarningTitle')),
          content: Text(
            AppTranslations.get(context, 'profile', 'originalLevelWarningDesc')
                .replaceAll('{from}', _originalLevel)
                .replaceAll('{to}', _selectedLevel)
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: Text(
                AppTranslations.get(context, 'profile', 'keepOriginal'),
                style: TextStyle(color: Theme.of(context).colorScheme.onSurfaceVariant),
              ),
            ),
            ElevatedButton(
              onPressed: () => Navigator.pop(context, true),
              style: ElevatedButton.styleFrom(backgroundColor: Theme.of(context).colorScheme.primary),
              child: Text(
                AppTranslations.get(context, 'profile', 'agree'),
                style: const TextStyle(color: Colors.white),
              ),
            ),
          ],
        ),
      );

      if (confirm != true) {
        return;
      }
    }

    await _executeSave();
  }

  /// Gọi API cập nhật thông tin cá nhân thực tế
  Future<void> _executeSave() async {
    final authProvider = context.read<AuthProvider>();
    final success = await authProvider.updateProfile(
      fullName: _fullNameController.text.trim(),
      phone: _normalizePhone(_phoneController.text.trim()),
      level: _selectedLevel,
      avatarUrl: _avatarUrlController.text.trim().isEmpty ? null : _avatarUrlController.text.trim(),
    );

    if (mounted) {
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(AppTranslations.get(context, 'profile', 'saveSuccess')),
            backgroundColor: Theme.of(context).colorScheme.primary,
          ),
        );
        Navigator.pop(context);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(authProvider.errorMessage ?? AppTranslations.get(context, 'profile', 'saveFailed')),
            backgroundColor: Theme.of(context).colorScheme.error,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final previewUrl = _avatarUrlController.text.trim();
    final user = authProvider.user;

    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.surface,
      appBar: AppBar(
        title: Text(AppTranslations.get(context, 'profile', 'editProfile')),
        elevation: 0,
      ),
      body: GestureDetector(
        onTap: () => FocusScope.of(context).unfocus(),
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Khung hiển thị và chọn ảnh đại diện dạng tròn nổi bật
                Center(
                  child: Stack(
                    children: [
                      Container(
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(color: Theme.of(context).colorScheme.primary, width: 3),
                          boxShadow: [
                            BoxShadow(
                              color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.15),
                              blurRadius: 16,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: CircleAvatar(
                          radius: 56,
                          backgroundColor: Theme.of(context).brightness == Brightness.dark ? const Color(0xFF26262B) : AppColors.surfaceContainer,
                          backgroundImage: previewUrl.isNotEmpty ? _getAvatarImage(previewUrl) : null,
                          child: previewUrl.isEmpty
                              ? Text(
                                  user?.avatarInitial ?? 'U',
                                  style: AppTextStyles.headlineMd.copyWith(
                                    fontSize: 44,
                                    color: Theme.of(context).colorScheme.primary,
                                  ),
                                )
                              : null,
                        ),
                      ),
                      // Nút chọn ảnh từ thiết bị
                      Positioned(
                        bottom: 0,
                        right: previewUrl.isNotEmpty ? 36 : 0,
                        child: GestureDetector(
                          onTap: _pickLocalImage,
                          child: CircleAvatar(
                            radius: 18,
                            backgroundColor: Theme.of(context).colorScheme.primary,
                            child: const Icon(
                              Icons.camera_alt,
                              color: Colors.white,
                              size: 18,
                            ),
                          ),
                        ),
                      ),
                      // Nút xóa ảnh đại diện đang chọn
                      if (previewUrl.isNotEmpty)
                        Positioned(
                          bottom: 0,
                          right: 0,
                          child: GestureDetector(
                            onTap: () {
                              _avatarUrlController.clear();
                            },
                            child: CircleAvatar(
                              radius: 16,
                              backgroundColor: Theme.of(context).colorScheme.error,
                              child: const Icon(
                                Icons.close,
                                color: Colors.white,
                                size: 16,
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Danh sách hình đại diện mẫu DiceBear gợi ý
                Text(
                  AppTranslations.get(context, 'profile', 'avatarSelection'),
                  style: AppTextStyles.bodyMd.copyWith(
                    fontWeight: FontWeight.bold,
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: 8),
                SizedBox(
                  height: 64,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: _presetAvatars.length,
                    itemBuilder: (context, index) {
                      final preset = _presetAvatars[index];
                      final isSelected = previewUrl == preset['url'];

                      return GestureDetector(
                        onTap: () {
                          _avatarUrlController.text = preset['url']!;
                        },
                        child: Container(
                          margin: const EdgeInsets.only(right: 12),
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: isSelected ? Theme.of(context).colorScheme.primary : Colors.transparent,
                              width: 2.5,
                            ),
                          ),
                          child: CircleAvatar(
                            radius: 28,
                            backgroundColor: Theme.of(context).brightness == Brightness.dark ? const Color(0xFF26262B) : AppColors.surfaceContainer,
                            backgroundImage: NetworkImage(preset['url']!),
                          ),
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 20),

                // Đường dẫn URL ảnh đại diện tùy chỉnh
                TextFormField(
                  controller: _avatarUrlController,
                  decoration: InputDecoration(
                    labelText: AppTranslations.get(context, 'profile', 'avatarUrlLabel'),
                    hintText: AppTranslations.get(context, 'profile', 'hintAvatarUrl'),
                    prefixIcon: Icon(Icons.image_outlined, color: Theme.of(context).colorScheme.primary),
                    border: OutlineInputBorder(
                      borderSide: BorderSide(color: Theme.of(context).colorScheme.outlineVariant),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: BorderSide(color: Theme.of(context).colorScheme.primary, width: 2),
                    ),
                  ),
                  keyboardType: TextInputType.url,
                ),
                const SizedBox(height: 16),

                // Email
                TextFormField(
                  initialValue: user?.email ?? '',
                  decoration: InputDecoration(
                    labelText: AppTranslations.get(context, 'profile', 'emailReadOnly'),
                    prefixIcon: Icon(Icons.email_outlined, color: Theme.of(context).colorScheme.outline),
                    filled: true,
                    fillColor: Theme.of(context).brightness == Brightness.dark ? const Color(0xFF26262B).withValues(alpha: 0.5) : AppColors.surfaceContainerHigh.withValues(alpha: 0.5),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                    disabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: BorderSide(color: Theme.of(context).colorScheme.outlineVariant),
                    ),
                  ),
                  readOnly: true,
                  enabled: false,
                  style: TextStyle(color: Theme.of(context).colorScheme.outline),
                ),
                const SizedBox(height: 16),

                // Họ và tên
                TextFormField(
                  controller: _fullNameController,
                  decoration: InputDecoration(
                    labelText: AppTranslations.get(context, 'profile', 'fullName'),
                    hintText: AppTranslations.get(context, 'profile', 'nameHint'),
                    prefixIcon: Icon(Icons.person_outline, color: Theme.of(context).colorScheme.primary),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: BorderSide(color: Theme.of(context).colorScheme.primary, width: 2),
                    ),
                  ),
                  validator: _validateFullName,
                  textCapitalization: TextCapitalization.words,
                ),
                const SizedBox(height: 16),

                // Số điện thoại
                TextFormField(
                  controller: _phoneController,
                  decoration: InputDecoration(
                    labelText: AppTranslations.get(context, 'profile', 'phone'),
                    hintText: AppTranslations.get(context, 'profile', 'phoneHint'),
                    prefixIcon: Icon(Icons.phone_outlined, color: Theme.of(context).colorScheme.primary),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: BorderSide(color: Theme.of(context).colorScheme.primary, width: 2),
                    ),
                  ),
                  keyboardType: TextInputType.phone,
                  validator: _validatePhone,
                ),
                const SizedBox(height: 20),

                // Trình chọn cấp độ JLPT dạng ChoiceChips nổi bật
                Text(
                  AppTranslations.get(context, 'profile', 'jlptLevel'),
                  style: AppTextStyles.bodyMd.copyWith(
                    fontWeight: FontWeight.bold,
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: _levels.map((lvl) {
                    final isSelected = _selectedLevel == lvl;
                    return ChoiceChip(
                      label: Text(
                        lvl,
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: isSelected ? Colors.white : Theme.of(context).colorScheme.primary,
                        ),
                      ),
                      selected: isSelected,
                      selectedColor: Theme.of(context).colorScheme.primary,
                      backgroundColor: Theme.of(context).brightness == Brightness.dark ? const Color(0xFF26262B) : AppColors.surfaceContainer,
                      checkmarkColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      side: BorderSide(
                        color: isSelected ? Theme.of(context).colorScheme.primary : Theme.of(context).colorScheme.outlineVariant,
                      ),
                      onSelected: (selected) {
                        if (selected) {
                          setState(() {
                            _selectedLevel = lvl;
                          });
                        }
                      },
                    );
                  }).toList(),
                ),
                const SizedBox(height: 36),

                // Nút Lưu thay đổi
                ElevatedButton(
                  onPressed: authProvider.isLoading ? null : _submitForm,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Theme.of(context).colorScheme.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                    elevation: 2,
                  ),
                  child: authProvider.isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2.5,
                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        )
                      : Text(
                          AppTranslations.get(context, 'profile', 'saveChanges'),
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
