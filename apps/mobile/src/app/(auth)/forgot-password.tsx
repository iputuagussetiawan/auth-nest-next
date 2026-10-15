import { Link } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { authApi } from '@/lib/auth-api';
import { validateEmail } from '@/lib/validation';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState(''); const [error, setError] = useState(''); const [notice, setNotice] = useState(''); const [submitting, setSubmitting] = useState(false);
  async function onSubmit() {
    const validation = validateEmail(email); if (validation) { setError(validation); return; }
    setSubmitting(true); setError('');
    try { await authApi.forgotPassword({ email: email.trim().toLowerCase() }); setNotice('If the account exists, a reset link was sent. Finish resetting your password on the web app.'); }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to send reset link.'); } finally { setSubmitting(false); }
  }
  return <SafeAreaView className="flex-1 bg-[#f0fdf4] dark:bg-[#020c06]"><KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView contentContainerClassName="flex-grow justify-center px-6 py-10"><View className="mx-auto w-full max-w-md"><Text className="text-sm font-semibold uppercase tracking-[3px] text-[#10AF13]">Reset access</Text><Text className="mt-3 text-4xl font-bold text-[#052e16] dark:text-[#d1fae5]">Forgot password</Text><Text className="mt-3 text-base leading-6 text-[#166534]">Enter your email and we&apos;ll send a reset link.</Text><View className="mt-10"><Text className="mb-2 text-sm font-medium text-[#052e16]">Email</Text><TextInput className={`rounded-2xl border bg-white px-4 py-4 text-base text-[#052e16] ${error ? 'border-red-500' : 'border-emerald-300'}`} placeholder="you@example.com" placeholderTextColor="#6ee7b7" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={(value) => { setEmail(value); setError(''); }} />{!!error && <Text className="mt-2 text-sm text-red-500">{error}</Text>}</View>{!!notice && <Text className="mt-5 text-center text-sm text-emerald-700">{notice}</Text>}<Pressable disabled={submitting} onPress={onSubmit} className="mt-8 items-center rounded-2xl bg-[#10AF13] py-4">{submitting ? <ActivityIndicator color="#fff" /> : <Text className="text-base font-bold text-white">Send reset link</Text>}</Pressable><Link href="/(auth)/login" asChild><Text className="mt-8 self-center text-sm font-semibold text-[#10AF13]">Back to sign in</Text></Link></View></ScrollView></KeyboardAvoidingView></SafeAreaView>;
}
