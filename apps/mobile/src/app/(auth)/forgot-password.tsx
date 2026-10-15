import { Link, router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AuthCard, AuthHeader, AuthScreen, Field, FormAlert, PrimaryButton } from '@/components/auth-ui';
import { usePalette } from '@/hooks/use-palette';
import { authApi } from '@/lib/auth-api';
import { validateEmail } from '@/lib/validation';

// The API allows two reset emails per three minutes, so space out resends
const RESEND_AFTER_SECONDS = 60;

export default function ForgotPasswordScreen() {
  const palette = usePalette();
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sentTo, setSentTo] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function send() {
    if (submitting) return;
    const validation = validateEmail(email);
    if (validation) {
      setFieldError(validation);
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      const address = email.trim().toLowerCase();
      await authApi.forgotPassword({ email: address });
      setSentTo(address);
      setCooldown(RESEND_AFTER_SECONDS);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to send the reset link. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (sentTo) {
    return (
      <AuthScreen>
        <AuthHeader icon={{ ios: 'envelope.badge', android: 'mark_email_unread', web: 'mark_email_unread' }} title="Check your email" subtitle="Your reset link is on its way." />
        <AuthCard>
          <FormAlert message={formError} />
          {/* Same wording whether or not the account exists, like the API's answer */}
          <Text className="text-center text-base leading-6 text-foreground dark:text-foreground-dark">
            If an account exists for <Text className="font-semibold">{sentTo}</Text>, we&apos;ve sent a link to reset its password. It expires in 1 hour.
          </Text>
          <View className="mt-5 flex-row items-start gap-3 rounded-2xl bg-secondary p-4 dark:bg-secondary-dark">
            <SymbolView name={{ ios: 'info.circle', android: 'info', web: 'info' }} size={18} tintColor={palette.mutedForeground} />
            <Text className="flex-1 text-sm text-muted-foreground dark:text-muted-foreground-dark">
              The link opens in your browser. Set your new password there, then sign in here with it.
            </Text>
          </View>

          <View className="mt-6">
            <PrimaryButton label="Back to sign in" busyLabel="" busy={false} disabled={false} onPress={() => router.replace('/(auth)/login')} />
          </View>

          <View className="mt-5 items-center gap-3">
            <Pressable accessibilityRole="button" accessibilityState={{ disabled: cooldown > 0 || submitting }} disabled={cooldown > 0 || submitting} hitSlop={8} onPress={send}>
              <Text className={`text-sm font-semibold ${cooldown > 0 || submitting ? 'text-muted-foreground dark:text-muted-foreground-dark' : 'text-foreground dark:text-foreground-dark'}`}>
                {submitting ? 'Sending...' : cooldown > 0 ? `Didn't get it? Send again in ${cooldown}s` : "Didn't get it? Send again"}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => {
                setSentTo('');
                setFormError('');
              }}>
              <Text className="text-sm text-muted-foreground dark:text-muted-foreground-dark">Use a different email</Text>
            </Pressable>
          </View>
        </AuthCard>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen>
      <AuthHeader icon={{ ios: 'key.fill', android: 'key', web: 'key' }} title="Forgot your password?" subtitle="Enter your email and we'll send you a link to reset it." />

      <AuthCard>
        <FormAlert message={formError} />

        <Field
          label="Email"
          icon={{ ios: 'envelope', android: 'mail', web: 'mail' }}
          error={fieldError}
          placeholder="you@example.com"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          keyboardType="email-address"
          returnKeyType="send"
          onSubmitEditing={send}
          editable={!submitting}
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            setFieldError('');
            setFormError('');
          }}
        />

        <View className="mt-6">
          <PrimaryButton label="Send reset link" busyLabel="Sending..." busy={submitting} disabled={submitting} onPress={send} />
        </View>
      </AuthCard>

      <View className="mt-8 flex-row justify-center gap-1">
        <Text className="text-muted-foreground dark:text-muted-foreground-dark">Remembered it?</Text>
        <Link href="/(auth)/login" asChild>
          <Pressable accessibilityRole="link" hitSlop={8}>
            <Text className="font-semibold text-foreground dark:text-foreground-dark">Sign in</Text>
          </Pressable>
        </Link>
      </View>
    </AuthScreen>
  );
}
