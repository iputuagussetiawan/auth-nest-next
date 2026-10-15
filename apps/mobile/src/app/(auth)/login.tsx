import { router, Link } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { AuthCard, AuthHeader, AuthScreen, Field, FormAlert, GoogleButton, OrDivider, PasswordToggle, PrimaryButton } from '@/components/auth-ui';
import { validateEmail, validatePassword, type FormErrors } from '@/lib/validation';
import { useAuth } from '@/providers/auth-provider';

export default function LoginScreen() {
  const { signIn, signInWithGoogle } = useAuth();
  const passwordRef = useRef<TextInput>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const busy = submitting || googleBusy;

  function clearError(field: string) {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: '' } : prev));
    setFormError('');
  }

  async function onSubmit() {
    if (busy) return;
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

  async function onGoogle() {
    if (busy) return;
    setFormError('');
    setGoogleBusy(true);
    try {
      if (await signInWithGoogle()) router.replace('/(auth)/dashboard');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Google sign-in failed. Please try again.');
    } finally {
      setGoogleBusy(false);
    }
  }

  return (
    <AuthScreen>
      <AuthHeader icon={{ ios: 'lock.shield.fill', android: 'shield_lock', web: 'shield_lock' }} title="Welcome back" subtitle="Sign in to continue to your account." />

      <AuthCard>
        <FormAlert message={formError} />

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
            editable={!busy}
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
            editable={!busy}
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              clearError('password');
            }}
            trailing={<PasswordToggle visible={showPassword} onToggle={() => setShowPassword((v) => !v)} />}
          />
        </View>

        <Link href="/(auth)/forgot-password" asChild>
          <Pressable accessibilityRole="link" hitSlop={8} className="mt-4 self-end">
            <Text className="text-sm font-semibold text-foreground dark:text-foreground-dark">Forgot password?</Text>
          </Pressable>
        </Link>

        <View className="mt-6">
          <PrimaryButton label="Sign in" busyLabel="Signing in..." busy={submitting} disabled={busy} onPress={onSubmit} />
        </View>

        <OrDivider />
        <GoogleButton busy={googleBusy} disabled={busy} onPress={onGoogle} />
      </AuthCard>

      <View className="mt-8 flex-row justify-center gap-1">
        <Text className="text-muted-foreground dark:text-muted-foreground-dark">New here?</Text>
        <Link href="/(auth)/register" asChild>
          <Pressable accessibilityRole="link" hitSlop={8}>
            <Text className="font-semibold text-foreground dark:text-foreground-dark">Create an account</Text>
          </Pressable>
        </Link>
      </View>
    </AuthScreen>
  );
}
