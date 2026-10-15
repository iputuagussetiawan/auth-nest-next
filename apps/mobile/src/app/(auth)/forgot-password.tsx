import { Link } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { authApi } from '@/lib/auth-api';
import { usePalette } from '@/hooks/use-palette';
import { validateEmail } from '@/lib/validation';

export default function ForgotPasswordScreen() {
  const palette = usePalette();
  const [email, setEmail] = useState(''); const [error, setError] = useState(''); const [notice, setNotice] = useState(''); const [submitting, setSubmitting] = useState(false);
  async function onSubmit() {
    const validation = validateEmail(email); if (validation) { setError(validation); return; }
    setSubmitting(true); setError('');
    try { await authApi.forgotPassword({ email: email.trim().toLowerCase() }); setNotice('If the account exists, a reset link was sent. Finish resetting your password on the web app.'); }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to send reset link.'); } finally { setSubmitting(false); }
  }
  return <SafeAreaView className="flex-1 bg-background dark:bg-background-dark"><KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView contentContainerClassName="flex-grow justify-center px-6 py-10"><View className="mx-auto w-full max-w-md"><Text className="text-sm font-semibold uppercase tracking-[3px] text-muted-foreground dark:text-muted-foreground-dark">Reset access</Text><Text className="mt-3 text-4xl font-bold text-foreground dark:text-foreground-dark">Forgot password</Text><Text className="mt-3 text-base leading-6 text-muted-foreground dark:text-muted-foreground-dark">Enter your email and we&apos;ll send a reset link.</Text><View className="mt-10"><Text className="mb-2 text-sm font-medium text-foreground dark:text-foreground-dark">Email</Text><TextInput className={`rounded-2xl border bg-card dark:bg-card-dark px-4 py-4 text-base text-foreground dark:text-foreground-dark ${error ? 'border-red-500' : 'border-border dark:border-border-dark'}`} placeholder="you@example.com" placeholderTextColor={palette.mutedForeground} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={(value) => { setEmail(value); setError(''); }} />{!!error && <Text className="mt-2 text-sm text-red-500">{error}</Text>}</View>{!!notice && <Text className="mt-5 text-center text-sm text-foreground dark:text-foreground-dark">{notice}</Text>}<Pressable disabled={submitting} onPress={onSubmit} className="mt-8 items-center rounded-2xl bg-primary dark:bg-primary-dark py-4">{submitting ? <ActivityIndicator color={palette.primaryForeground} /> : <Text className="text-base font-bold text-primary-foreground dark:text-primary-foreground-dark">Send reset link</Text>}</Pressable><Link href="/(auth)/login" asChild><Text className="mt-8 self-center text-sm font-semibold text-foreground dark:text-foreground-dark">Back to sign in</Text></Link></View></ScrollView></KeyboardAvoidingView></SafeAreaView>;
}
