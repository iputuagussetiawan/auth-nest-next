import { Link } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { validateEmail, validatePassword, validateRequired, type FormErrors } from '@/lib/validation';
import { useAuth } from '@/providers/auth-provider';

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false); const [showConfirmation, setShowConfirmation] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({}); const [formError, setFormError] = useState(''); const [notice, setNotice] = useState(''); const [submitting, setSubmitting] = useState(false);
  const clearError = (field: string) => { setErrors((p) => ({ ...p, [field]: '' })); setFormError(''); };
  async function onSubmit() {
    const fullName = name.trim(); const split = fullName.indexOf(' '); const firstName = split < 0 ? fullName : fullName.slice(0, split); const lastName = split < 0 ? '' : fullName.slice(split + 1).trim();
    const next = { name: validateRequired(name, 'Name') || (!lastName ? 'Enter your first and last name.' : ''), email: validateEmail(email), password: validatePassword(password), confirmation: !confirmation ? 'Please confirm your password.' : confirmation !== password ? 'Passwords do not match.' : '' };
    setErrors(next); if (Object.values(next).some(Boolean)) return;
    setSubmitting(true); setNotice('');
    try { await signUp({ firstName, lastName, email, password }); setNotice('Account created. Check your email to verify your account before signing in.'); }
    catch (err) { setFormError(err instanceof Error ? err.message : 'Registration failed.'); } finally { setSubmitting(false); }
  }
  const input = (label: string, value: string, setValue: (v: string) => void, field: string, props: any = {}) => {
    const passwordField = field === 'password' || field === 'confirmation';
    const visible = field === 'password' ? showPassword : showConfirmation;
    return <View><Text className="mb-2 text-sm font-medium text-[#052e16] dark:text-[#d1fae5]">{label}</Text><View className={`flex-row items-center rounded-2xl border bg-white dark:bg-emerald-950 ${errors[field] ? 'border-red-500' : 'border-emerald-300 dark:border-emerald-900'}`}><TextInput {...props} className="flex-1 px-4 py-4 text-base text-[#052e16] dark:text-[#d1fae5]" secureTextEntry={passwordField && !visible} value={value} onChangeText={(v) => { setValue(v); clearError(field); }} />{passwordField && <Pressable accessibilityLabel={visible ? 'Hide password' : 'Show password'} accessibilityRole="button" className="px-4 py-4" onPress={() => (field === 'password' ? setShowPassword : setShowConfirmation)((current) => !current)}><SymbolView name={{ ios: visible ? 'eye.slash' : 'eye', android: visible ? 'visibility_off' : 'visibility', web: visible ? 'visibility_off' : 'visibility' }} size={22} tintColor="#10AF13" /></Pressable>}</View>{!!errors[field] && <Text className="mt-2 text-sm text-red-500">{errors[field]}</Text>}</View>;
  };
  return <SafeAreaView className="flex-1 bg-[#f0fdf4] dark:bg-[#020c06]"><KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView contentContainerClassName="flex-grow justify-center px-6 py-10"><View className="mx-auto w-full max-w-md"><Text className="text-sm font-semibold uppercase tracking-[3px] text-[#10AF13]">Get started</Text><Text className="mt-3 text-4xl font-bold text-[#052e16] dark:text-[#d1fae5]">Create account</Text><View className="mt-10 gap-5">{input('Name', name, setName, 'name', { placeholder: 'First and last name', placeholderTextColor: '#6ee7b7' })}{input('Email', email, setEmail, 'email', { placeholder: 'you@example.com', placeholderTextColor: '#6ee7b7', autoCapitalize: 'none', keyboardType: 'email-address' })}{input('Password', password, setPassword, 'password', { placeholder: 'Create a password', placeholderTextColor: '#6ee7b7' })}{input('Confirm password', confirmation, setConfirmation, 'confirmation', { placeholder: 'Repeat your password', placeholderTextColor: '#6ee7b7' })}</View>{!!formError && <Text className="mt-5 text-center text-sm text-red-500">{formError}</Text>}{!!notice && <Text className="mt-5 text-center text-sm text-emerald-700">{notice}</Text>}<Pressable disabled={submitting} onPress={onSubmit} className="mt-8 items-center rounded-2xl bg-[#10AF13] py-4">{submitting ? <ActivityIndicator color="#fff" /> : <Text className="text-base font-bold text-white">Create account</Text>}</Pressable><View className="mt-8 flex-row justify-center gap-1"><Text className="text-[#166534]">Already have an account?</Text><Link href="/(auth)/login" asChild><Text className="font-semibold text-[#10AF13]">Sign in</Text></Link></View></View></ScrollView></KeyboardAvoidingView></SafeAreaView>;
}
