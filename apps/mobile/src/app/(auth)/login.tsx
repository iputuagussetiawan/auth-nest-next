import { router, Link } from 'expo-router';
import { useRef, useState, type ReactNode, type Ref } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View, type TextInputProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import Svg, { Path } from 'react-native-svg';

import { usePalette } from '@/hooks/use-palette';
import { validateEmail, validatePassword, type FormErrors } from '@/lib/validation';
import { useAuth } from '@/providers/auth-provider';

type FieldProps = TextInputProps & {
  label: string;
  icon: SymbolViewProps['name'];
  error?: string;
  inputRef?: Ref<TextInput>;
  trailing?: ReactNode;
};

function Field({ label, icon, error, inputRef, trailing, onFocus, onBlur, ...input }: FieldProps) {
  const palette = usePalette();
  const [focused, setFocused] = useState(false);
  const border = error ? 'border-red-500' : focused ? 'border-ring dark:border-ring-dark' : 'border-border dark:border-border-dark';

  return (
    <View>
      <Text className="mb-2 text-sm font-medium text-foreground dark:text-foreground-dark">{label}</Text>
      <View className={`flex-row items-center rounded-2xl border bg-card dark:bg-card-dark ${border}`}>
        <View className="pl-4">
          <SymbolView name={icon} size={20} tintColor={error ? '#ef4444' : focused ? palette.ring : palette.mutedForeground} />
        </View>
        <TextInput
          ref={inputRef}
          accessibilityLabel={label}
          className="flex-1 px-3 py-4 text-base text-foreground dark:text-foreground-dark"
          placeholderTextColor={palette.mutedForeground}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...input}
        />
        {trailing}
      </View>
      {!!error && <Text className="mt-2 text-sm text-red-500 dark:text-red-400">{error}</Text>}
    </View>
  );
}

export default function LoginScreen() {
  const { signIn } = useAuth();
  const palette = usePalette();
  const passwordRef = useRef<TextInput>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function clearError(field: string) {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: '' } : prev));
    setFormError('');
    setNotice('');
  }

  async function onSubmit() {
    if (submitting) return;
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
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerClassName="flex-grow justify-center px-6 py-10" keyboardShouldPersistTaps="handled">
          <View className="mx-auto w-full max-w-md">
            <View className="items-center">
              <View className="h-16 w-16 items-center justify-center rounded-3xl bg-primary dark:bg-primary-dark">
                <SymbolView name={{ ios: 'lock.shield.fill', android: 'shield_lock', web: 'shield_lock' }} size={32} tintColor={palette.primaryForeground} />
              </View>
              <Text className="mt-6 w-full text-center text-3xl font-bold text-foreground dark:text-foreground-dark">Welcome back</Text>
              <Text className="mt-2 w-full text-center text-base text-muted-foreground dark:text-muted-foreground-dark">Sign in to continue to your account.</Text>
            </View>

            <View className="mt-8 rounded-3xl border border-border dark:border-border-dark bg-card dark:bg-card-dark p-5">
              {!!formError && (
                <View accessibilityRole="alert" className="mb-5 flex-row items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
                  <SymbolView name={{ ios: 'exclamationmark.circle.fill', android: 'error', web: 'error' }} size={20} tintColor="#ef4444" />
                  <Text className="flex-1 text-sm text-red-700 dark:text-red-300">{formError}</Text>
                </View>
              )}

              <View className="gap-5">
                <Field
                  label="Email"
                  icon={{ ios: 'envelope', android: 'mail', web: 'mail' }}
                  error={errors.email}
                  placeholder="you@example.com"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  keyboardType="email-address"
                  returnKeyType="next"
                  submitBehavior="submit"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  editable={!submitting}
                  value={email}
                  onChangeText={(v) => {
                    setEmail(v);
                    clearError('email');
                  }}
                />
                <Field
                  label="Password"
                  icon={{ ios: 'lock', android: 'lock', web: 'lock' }}
                  inputRef={passwordRef}
                  error={errors.password}
                  placeholder="Enter your password"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="current-password"
                  textContentType="password"
                  secureTextEntry={!showPassword}
                  returnKeyType="go"
                  onSubmitEditing={onSubmit}
                  editable={!submitting}
                  value={password}
                  onChangeText={(v) => {
                    setPassword(v);
                    clearError('password');
                  }}
                  trailing={
                    <Pressable
                      accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                      accessibilityRole="button"
                      hitSlop={8}
                      className="px-4 py-4"
                      onPress={() => setShowPassword((visible) => !visible)}>
                      <SymbolView
                        name={{ ios: showPassword ? 'eye.slash' : 'eye', android: showPassword ? 'visibility_off' : 'visibility', web: showPassword ? 'visibility_off' : 'visibility' }}
                        size={22}
                        tintColor={palette.mutedForeground}
                      />
                    </Pressable>
                  }
                />
              </View>

              <Link href="/(auth)/forgot-password" asChild>
                <Pressable accessibilityRole="link" hitSlop={8} className="mt-4 self-end">
                  <Text className="text-sm font-semibold text-foreground dark:text-foreground-dark">Forgot password?</Text>
                </Pressable>
              </Link>

              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: submitting, busy: submitting }}
                disabled={submitting}
                onPress={onSubmit}
                className={`mt-6 h-14 flex-row items-center justify-center gap-2 rounded-2xl bg-primary dark:bg-primary-dark active:opacity-80 ${submitting ? 'opacity-80' : ''}`}>
                {submitting ? (
                  <>
                    <ActivityIndicator color={palette.primaryForeground} />
                    <Text className="text-base font-bold text-primary-foreground dark:text-primary-foreground-dark">Signing in...</Text>
                  </>
                ) : (
                  <Text className="text-base font-bold text-primary-foreground dark:text-primary-foreground-dark">Sign in</Text>
                )}
              </Pressable>

              <View className="my-6 flex-row items-center gap-3">
                <View className="h-px flex-1 bg-border dark:bg-border-dark" />
                <Text className="text-xs font-medium uppercase tracking-wide text-muted-foreground dark:text-muted-foreground-dark">or</Text>
                <View className="h-px flex-1 bg-border dark:bg-border-dark" />
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={() => setNotice("Google sign-in isn't available in the app yet. Please use your email and password.")}
                className="h-14 flex-row items-center justify-center gap-3 rounded-2xl border border-border dark:border-border-dark bg-card dark:bg-card-dark active:bg-secondary dark:active:bg-secondary-dark">
                <Svg width={20} height={20} viewBox="0 0 24 24">
                  <Path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.57 5.57 0 0 1-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
                  <Path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24z" />
                  <Path fill="#FBBC05" d="M5.27 14.29A7.2 7.2 0 0 1 4.89 12c0-.8.14-1.57.38-2.29V6.62H1.29a11.99 11.99 0 0 0 0 10.76l3.98-3.09z" />
                  <Path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.69 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
                </Svg>
                <Text className="text-base font-semibold text-foreground dark:text-foreground-dark">Continue with Google</Text>
              </Pressable>
              {!!notice && <Text className="mt-3 text-center text-sm text-muted-foreground dark:text-muted-foreground-dark">{notice}</Text>}
            </View>

            <View className="mt-8 flex-row justify-center gap-1">
              <Text className="text-muted-foreground dark:text-muted-foreground-dark">New here?</Text>
              <Link href="/(auth)/register" asChild>
                <Pressable accessibilityRole="link" hitSlop={8}>
                  <Text className="font-semibold text-foreground dark:text-foreground-dark">Create an account</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
