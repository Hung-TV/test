import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../common/theme/app_text_styles.dart';
import '../../../core/localization/app_translations.dart';
import '../../../providers/auth_provider.dart';

class ForgotPasswordScreen extends StatefulWidget {
  final String initialEmail;

  const ForgotPasswordScreen({
    super.key,
    this.initialEmail = '',
  });

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController emailController;

  bool _hasSubmitted = false;

  @override
  void initState() {
    super.initState();
    emailController = TextEditingController(text: widget.initialEmail);
  }

  @override
  void dispose() {
    emailController.dispose();
    super.dispose();
  }

  Future<void> handleForgotPassword() async {
    setState(() {
      _hasSubmitted = true;
    });

    FocusScope.of(context).unfocus();

    final isValid = _formKey.currentState?.validate() ?? false;
    if (!isValid) return;

    final authProvider = context.read<AuthProvider>();
    final success = await authProvider.forgotPassword(emailController.text.trim());

    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context)
        ..hideCurrentSnackBar()
        ..showSnackBar(
          SnackBar(
            content: Text(AppTranslations.get(context, 'auth', 'resetLinkSent')),
            backgroundColor: Colors.green,
          ),
        );
      Navigator.pop(context); // Trở về Login
    } else {
      ScaffoldMessenger.of(context)
        ..hideCurrentSnackBar()
        ..showSnackBar(
          SnackBar(
            content: Text(
              authProvider.errorMessage ??
                  AppTranslations.get(context, 'auth', 'forgotPasswordFailed'),
            ),
            backgroundColor: Theme.of(context).colorScheme.error,
          ),
        );
    }
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

  @override
  Widget build(BuildContext context) {
    final isLoading = context.watch<AuthProvider>().isLoading;
    final colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Text(
                'JELA',
                style: AppTextStyles.headlineLgMobile.copyWith(
                  fontSize: 48,
                  color: colorScheme.primary,
                  letterSpacing: -1,
                ),
              ),
              const SizedBox(height: 48),
              Card(
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(24),
                  side: BorderSide(color: colorScheme.outlineVariant),
                ),
                color: colorScheme.surface,
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
                          AppTranslations.get(context, 'auth', 'forgotPasswordTitle'),
                          style: AppTextStyles.headlineMd.copyWith(
                            color: colorScheme.primary,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          AppTranslations.get(context, 'auth', 'forgotPasswordDesc'),
                          style: AppTextStyles.bodyMd.copyWith(
                            color: colorScheme.onSurfaceVariant,
                          ),
                        ),
                        const SizedBox(height: 24),
                        TextFormField(
                          controller: emailController,
                          enabled: !isLoading,
                          keyboardType: TextInputType.emailAddress,
                          textInputAction: TextInputAction.done,
                          autofillHints: const [AutofillHints.email],
                          validator: _validateEmail,
                          onFieldSubmitted: (_) {
                            if (!isLoading) {
                              handleForgotPassword();
                            }
                          },
                          decoration: InputDecoration(
                            labelText: AppTranslations.get(context, 'auth', 'email'),
                            hintText: 'ten@example.com',
                            prefixIcon: const Icon(Icons.email_outlined),
                          ),
                        ),
                        const SizedBox(height: 24),
                        SizedBox(
                          width: double.infinity,
                          child: FilledButton(
                            onPressed: isLoading ? null : handleForgotPassword,
                            child: isLoading
                                ? const SizedBox(
                                    height: 20,
                                    width: 20,
                                    child: CircularProgressIndicator(strokeWidth: 2),
                                  )
                                : Text(AppTranslations.get(context, 'auth', 'sendResetLink')),
                          ),
                        ),
                        const SizedBox(height: 12),
                        SizedBox(
                          width: double.infinity,
                          child: OutlinedButton(
                            onPressed: isLoading
                                ? null
                                : () => Navigator.pop(context),
                            child: Text(AppTranslations.get(context, 'auth', 'backToLogin')),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
