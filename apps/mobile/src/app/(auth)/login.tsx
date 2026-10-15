import { router, Link } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import Svg, { Path } from 'react-native-svg';

import { validateEmail, validatePassword, type FormErrors } from '@/lib/validation';
import { useAuth } from '@/providers/auth-provider';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function clearError(field: string) {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: '' } : prev));
    setFormError('');
  }

  async function onSubmit() {
    const next: FormErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setErrors(next);
    if (next.email || next.password) return;

    setSubmitting(true);
    try {
      await signIn(email, password);
      router.replace('/(auth)/dashboard');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Sign in failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f0fdf4] dark:bg-[#020c06]">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerClassName="flex-grow justify-center px-6 py-10">
          <View className="mx-auto w-full max-w-md">
            <Text className="text-sm font-semibold uppercase tracking-[3px] text-[#10AF13]">Welcome back</Text>
            <Text className="mt-3 text-4xl font-bold text-[#052e16] dark:text-[#d1fae5]">Sign in</Text>
            <Text className="mt-3 text-base leading-6 text-[#166534] dark:text-[#6ee7b7]">Continue to your account.</Text>

            <View className="mt-10 gap-5">
              <View>
                <Text className="mb-2 text-sm font-medium text-[#052e16] dark:text-[#d1fae5]">Email</Text>
                <TextInput
                  className={`rounded-2xl border bg-white px-4 py-4 text-base text-[#052e16] dark:bg-emerald-950 dark:text-[#d1fae5] ${errors.email ? 'border-red-500' : 'border-emerald-300 dark:border-emerald-900'}`}
                  placeholder="you@example.com"
                  placeholderTextColor="#6ee7b7"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={(v) => {
                    setEmail(v);
                    clearError('email');
                  }}
                />
                {!!errors.email && <Text className="mt-2 text-sm text-red-500 dark:text-red-400">{errors.email}</Text>}
              </View>
              <View>
                <Text className="mb-2 text-sm font-medium text-[#052e16] dark:text-[#d1fae5]">Password</Text>
                <View className={`flex-row items-center rounded-2xl border bg-white dark:bg-emerald-950 ${errors.password ? 'border-red-500' : 'border-emerald-300 dark:border-emerald-900'}`}>
                  <TextInput
                    className="flex-1 px-4 py-4 text-base text-[#052e16] dark:text-[#d1fae5]"
                    placeholder="Enter your password"
                    placeholderTextColor="#6ee7b7"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={(v) => {
                      setPassword(v);
                      clearError('password');
                    }}
                  />
                  <Pressable
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                    accessibilityRole="button"
                    className="px-4 py-4"
                    onPress={() => setShowPassword((visible) => !visible)}>
                    <SymbolView
                      name={{ ios: showPassword ? 'eye.slash' : 'eye', android: showPassword ? 'visibility_off' : 'visibility', web: showPassword ? 'visibility_off' : 'visibility' }}
                      size={22}
                      tintColor="#10AF13"
                    />
                  </Pressable>
                </View>
                {!!errors.password && <Text className="mt-2 text-sm text-red-500 dark:text-red-400">{errors.password}</Text>}
              </View>
            </View>

            <Link href="/(auth)/forgot-password" asChild>
              <Text className="mt-4 self-end text-sm font-semibold text-[#10AF13]">Forgot password?</Text>
            </Link>
            {!!formError && <Text className="mt-5 text-center text-sm text-red-500 dark:text-red-400">{formError}</Text>}
            <Pressable disabled={submitting} onPress={onSubmit} className="mt-8 items-center rounded-2xl bg-[#10AF13] py-4 active:bg-[#0d8f10] dark:bg-[#10AF13] dark:active:bg-[#0d8f10]">
              {submitting ? <ActivityIndicator color="#fff" /> : <Text className="text-base font-bold text-white dark:text-[#020c06]">Sign in</Text>}
            </Pressable>

            <View className="mt-6 flex-row items-center gap-3">
              <View className="h-px flex-1 bg-emerald-200 dark:bg-emerald-900" />
              <Text className="text-xs font-medium uppercase tracking-wide text-[#166534] dark:text-[#6ee7b7]">or</Text>
              <View className="h-px flex-1 bg-emerald-200 dark:bg-emerald-900" />
            </View>
            <Pressable className="mt-6 flex-row items-center justify-center gap-2 rounded-2xl border border-emerald-300 bg-white py-4 active:bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950 dark:active:bg-emerald-900">
              <Svg width={20} height={20} viewBox="0 0 24 24">
                <Path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.57 5.57 0 0 1-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
                <Path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24z" />
                <Path fill="#FBBC05" d="M5.27 14.29A7.2 7.2 0 0 1 4.89 12c0-.8.14-1.57.38-2.29V6.62H1.29a11.99 11.99 0 0 0 0 10.76l3.98-3.09z" />
                <Path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.69 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
              </Svg>
              <Text className="text-base font-bold text-[#052e16] dark:text-[#d1fae5]">Continue with Google</Text>
            </Pressable>

            <View className="mt-8 flex-row justify-center gap-1">
              <Text className="text-[#166534] dark:text-[#6ee7b7]">New here?</Text>
              <Link href="/(auth)/register" asChild><Text className="font-semibold text-[#10AF13]">Create an account</Text></Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
