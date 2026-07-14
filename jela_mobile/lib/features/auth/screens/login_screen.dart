import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_sign_in/google_sign_in.dart';

import '../../../common/theme/app_text_styles.dart';
import '../../../common/widgets/language_switcher_button.dart';
import '../../../core/localization/app_translations.dart';
import '../../../providers/auth_provider.dart';
import 'register_screen.dart';
import 'forgot_password_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final emailController = TextEditingController();
  final passwordController = TextEditingController();

  bool isPasswordVisible = false;
  bool _hasSubmitted = false;

  @override
  void dispose() {
    emailController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  Future<void> handleLogin() async {
    setState(() {
      _hasSubmitted = true;
    });

    FocusScope.of(context).unfocus();

    final isValid = _formKey.currentState?.validate() ?? false;
    if (!isValid) {
      _showSnackBar(AppTranslations.get(context, 'auth', 'loginFailed'));
      return;
    }

    final authProvider = context.read<AuthProvider>();
    final success = await authProvider.login(
      email: emailController.text.trim(),
      password: passwordController.text,
    );

    if (!success && mounted) {
      _showSnackBar(
          authProvider.errorMessage ?? AppTranslations.get(context, 'auth', 'loginFailed'));
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
    if (!_isValidEmail(email)) {
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

  bool _isValidEmail(String email) {
    final emailRegex = RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]{2,}$');
    return emailRegex.hasMatch(email);
  }

  Future<void> _handleGoogleLogin() async {
    setState(() {
      _hasSubmitted = false;
    });

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final GoogleSignIn googleSignIn = GoogleSignIn(
        clientId: '962773257163-l6fdpi0tn77tbg5305obmflcjn00kuef.apps.googleusercontent.com',
        scopes: [
          'email',
          'https://www.googleapis.com/auth/userinfo.profile',
        ],
      );

      final GoogleSignInAccount? googleUser = await googleSignIn.signIn();
      if (googleUser == null) {
        // User cancelled the sign-in flow
        return;
      }

      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      final String? idToken = googleAuth.idToken ?? googleAuth.accessToken;

      if (idToken == null) {
        _showSnackBar('Không thể lấy mã xác thực từ Google');
        return;
      }

      final success = await authProvider.loginWithGoogle(idToken);
      if (success) {
        if (mounted) {
          Navigator.of(context).pushReplacementNamed('/');
        }
      } else {
        final error = authProvider.errorMessage;
        _showSnackBar(error ?? 'Đăng nhập Google thất bại');
      }
    } catch (e) {
      _showSnackBar('Lỗi kết nối Google: $e');
    }
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
        actions: const [
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 16),
            child: LanguageSwitcherButton(),
          ),
        ],
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
              const SizedBox(height: 48),
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
                          AppTranslations.get(context, 'auth', 'loginTitle'),
                          style: AppTextStyles.headlineMd.copyWith(
                            color: Theme.of(context).colorScheme.primary,
                          ),
                        ),
                        const SizedBox(height: 24),
                        TextFormField(
                          controller: emailController,
                          enabled: !isLoading,
                          keyboardType: TextInputType.emailAddress,
                          textInputAction: TextInputAction.next,
                          autofillHints: const [AutofillHints.email],
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
                          autofillHints: const [AutofillHints.password],
                          validator: _validatePassword,
                          onFieldSubmitted: (_) {
                            if (!isLoading) {
                              handleLogin();
                            }
                          },
                          decoration: InputDecoration(
                            labelText: AppTranslations.get(context, 'auth', 'password'),
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
                        Align(
                          alignment: Alignment.centerRight,
                          child: TextButton(
                            onPressed: isLoading
                                ? null
                                : () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (_) => ForgotPasswordScreen(
                                          initialEmail: emailController.text.trim(),
                                        ),
                                      ),
                                    );
                                  },
                            child: Text(
                              AppTranslations.get(context, 'auth', 'forgotPassword'),
                              style: TextStyle(
                                color: Theme.of(context).colorScheme.primary,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 12),
                        SizedBox(
                          width: double.infinity,
                          child: FilledButton(
                            onPressed: isLoading ? null : handleLogin,
                            child: isLoading
                                ? const SizedBox(
                                    height: 20,
                                    width: 20,
                                    child: CircularProgressIndicator(strokeWidth: 2),
                                  )
                                : Text(AppTranslations.get(context, 'auth', 'loginButton')),
                          ),
                        ),
                        const SizedBox(height: 12),
                        SizedBox(
                          width: double.infinity,
                          child: OutlinedButton.icon(
                            onPressed: isLoading ? null : _handleGoogleLogin,
                            icon: const Icon(Icons.g_mobiledata),
                            label: const Text('Google'),
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
                    AppTranslations.get(context, 'auth', 'noAccount'),
                    style: AppTextStyles.bodyMd.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                  ),
                  TextButton(
                    onPressed: isLoading
                        ? null
                        : () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => const RegisterScreen(),
                              ),
                            );
                          },
                    child: Text(
                      AppTranslations.get(context, 'auth', 'registerNow'),
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
