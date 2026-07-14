import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../common/theme/app_text_styles.dart';
import '../../../common/widgets/language_switcher_button.dart';
import '../../../core/localization/app_translations.dart';
import '../../../providers/auth_provider.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final fullNameController = TextEditingController();
  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  
  String selectedLevel = 'N5';
  bool isPasswordVisible = false;
  bool _hasSubmitted = false;

  final List<String> jlptLevels = ['N5', 'N4', 'N3', 'N2', 'N1'];

  @override
  void dispose() {
    fullNameController.dispose();
    emailController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  Future<void> handleRegister() async {
    setState(() {
      _hasSubmitted = true;
    });

    FocusScope.of(context).unfocus();

    final isValid = _formKey.currentState?.validate() ?? false;
    if (!isValid) {
      _showSnackBar(AppTranslations.get(context, 'auth', 'registerFailed'));
      return;
    }

    final authProvider = context.read<AuthProvider>();
    final success = await authProvider.register(
      email: emailController.text.trim(),
      password: passwordController.text,
      fullName: fullNameController.text.trim(),
      level: selectedLevel,
    );

    if (!success && mounted) {
      final errorMessage = authProvider.errorMessage ?? AppTranslations.get(context, 'auth', 'registerFailed');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(errorMessage)));
      }
    } else if (success) {
      if (mounted) {
        final successMessage = AppTranslations.get(context, 'auth', 'registerSuccess');
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(successMessage)));
        Navigator.pop(context);
      }
    }
  }

  String? _validateFullName(String? value) {
    final name = value?.trim() ?? '';
    if (name.isEmpty) {
      return AppTranslations.get(context, 'auth', 'nameEmpty');
    }
    return null;
  }

  String? _validateEmail(String? value) {
    final email = value?.trim() ?? '';
    if (email.isEmpty) {
      return AppTranslations.get(context, 'auth', 'emailEmpty');
    }
    if (email.contains(' ')) {
      return AppTranslations.get(context, 'auth', 'emailInvalid');
    }
    if (!email.contains('@')) {
      return AppTranslations.get(context, 'auth', 'emailInvalid');
    }
    final emailRegex = RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]{2,}$');
    if (!emailRegex.hasMatch(email)) {
      return AppTranslations.get(context, 'auth', 'emailInvalid');
    }
    return null;
  }

  String? _validatePassword(String? value) {
    final password = value ?? '';
    if (password.isEmpty) {
      return AppTranslations.get(context, 'auth', 'passwordEmpty');
    }
    if (password.length < 6) {
      return AppTranslations.get(context, 'auth', 'passwordLength');
    }
    return null;
  }

  void _showSnackBar(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(message)));
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = context.watch<AuthProvider>().isLoading;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: Theme.of(context).colorScheme.onSurface),
          onPressed: isLoading ? null : () => Navigator.pop(context),
        ),
        actions: const [
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 16),
            child: LanguageSwitcherButton(),
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Text(
                'JELA',
                style: AppTextStyles.headlineLgMobile.copyWith(
                  fontSize: 40,
                  color: Theme.of(context).colorScheme.primary,
                  letterSpacing: -1,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Học tiếng Nhật dễ dàng hơn mỗi ngày',
                style: AppTextStyles.bodyMd.copyWith(
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),
              Card(
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(24),
                  side: BorderSide(color: Theme.of(context).colorScheme.outlineVariant),
                ),
                color: Theme.of(context).colorScheme.surface,
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Form(
                    key: _formKey,
                    autovalidateMode: _hasSubmitted
                        ? AutovalidateMode.onUserInteraction
                        : AutovalidateMode.disabled,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          AppTranslations.get(context, 'auth', 'registerTitle'),
                          style: AppTextStyles.headlineMd.copyWith(
                            color: Theme.of(context).colorScheme.primary,
                          ),
                        ),
                        const SizedBox(height: 24),
                        TextFormField(
                          controller: fullNameController,
                          enabled: !isLoading,
                          textInputAction: TextInputAction.next,
                          validator: _validateFullName,
                          decoration: InputDecoration(
                            labelText: AppTranslations.get(context, 'auth', 'fullName'),
                            prefixIcon: const Icon(Icons.person_outline),
                          ),
                        ),
                        const SizedBox(height: 16),
                        TextFormField(
                          controller: emailController,
                          enabled: !isLoading,
                          keyboardType: TextInputType.emailAddress,
                          textInputAction: TextInputAction.next,
                          validator: _validateEmail,
                          decoration: InputDecoration(
                            labelText: AppTranslations.get(context, 'auth', 'email'),
                            hintText: 'ten@example.com',
                            prefixIcon: const Icon(Icons.email_outlined),
                          ),
                        ),
                        const SizedBox(height: 16),
                        TextFormField(
                          controller: passwordController,
                          enabled: !isLoading,
                          obscureText: !isPasswordVisible,
                          textInputAction: TextInputAction.done,
                          validator: _validatePassword,
                          decoration: InputDecoration(
                            labelText: AppTranslations.get(context, 'auth', 'password'),
                            helperText: AppTranslations.get(context, 'auth', 'passwordHint'),
                            helperMaxLines: 2,
                            prefixIcon: const Icon(Icons.lock_outline),
                            suffixIcon: IconButton(
                              icon: Icon(
                                isPasswordVisible
                                    ? Icons.visibility_off
                                    : Icons.visibility,
                              ),
                              onPressed: isLoading
                                  ? null
                                  : () {
                                      setState(() {
                                        isPasswordVisible = !isPasswordVisible;
                                      });
                                    },
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
                        DropdownButtonFormField<String>(
                          initialValue: selectedLevel,
                          decoration: InputDecoration(
                            labelText: AppTranslations.get(context, 'auth', 'jlptLevel'),
                            prefixIcon: const Icon(Icons.school_outlined),
                          ),
                          items: jlptLevels.map((level) {
                            return DropdownMenuItem(
                              value: level,
                              child: Text(level),
                            );
                          }).toList(),
                          onChanged: isLoading
                              ? null
                              : (value) {
                                  if (value != null) {
                                    setState(() {
                                      selectedLevel = value;
                                    });
                                  }
                                },
                        ),
                        const SizedBox(height: 32),
                        SizedBox(
                          width: double.infinity,
                          child: FilledButton(
                            onPressed: isLoading ? null : handleRegister,
                            child: isLoading
                                ? const SizedBox(
                                    height: 20,
                                    width: 20,
                                    child: CircularProgressIndicator(strokeWidth: 2),
                                  )
                                : Text(AppTranslations.get(context, 'auth', 'registerButton')),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    AppTranslations.get(context, 'auth', 'hasAccount'),
                    style: AppTextStyles.bodyMd.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                  ),
                  TextButton(
                    onPressed: isLoading ? null : () => Navigator.pop(context),
                    child: Text(
                      AppTranslations.get(context, 'auth', 'loginNow'),
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: Theme.of(context).colorScheme.primary,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }
}
