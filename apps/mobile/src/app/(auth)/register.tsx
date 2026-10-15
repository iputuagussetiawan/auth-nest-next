import { Link } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { validateEmail, validatePassword, validateRequired, type FormErrors } from '@/lib/validation';
import { usePalette } from '@/hooks/use-palette';
import { useAuth } from '@/providers/auth-provider';

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const palette = usePalette();
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false); const [showConfirmation, setShowConfirmation] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({}); const [formError, setFormError] = useState(''); const [notice, setNotice] = useState(''); const [submitting, setSubmitting] = useState(false);
  const clearError = (field: string) => { setErrors((p) => ({ ...p, [field]: '' })); setFormError(''); };
  async function onSubmit() {
    const fullName = name.trim(); const split = fullName.indexOf(' '); const firstName = split < 0 ? fullName : fullName.slice(0, split); const lastName = split < 0 ? '' : fullName.slice(split + 1).trim();
    const next = { name: validateRequired(name, 'Name') || (!lastName ? 'Enter your first and last name.' : ''), email: validateEmail(email), password: validatePassword(password), confirmation: !confirmation ? 'Please confirm your password.' : confirmation !== password ? 'Passwords do not match.' : '' };
    setErrors(next); if (Object.values(next).some(Boolean)) return;
    setSubmitting(true); setNotice('');
    try { await signUp({ firstName, lastName, email, password }); setNotice('Check your email and follow the link in it to continue.'); }
    catch (err) { setFormError(err instanceof Error ? err.message : 'Registration failed.'); } finally { setSubmitting(false); }
  }
  const input = (label: string, value: string, setValue: (v: string) => void, field: string, props: any = {}) => {
    const passwordField = field === 'password' || field === 'confirmation';
    const visible = field === 'password' ? showPassword : showConfirmation;
    return <View><Text className="mb-2 text-sm font-medium text-foreground dark:text-foreground-dark">{label}</Text><View className={`flex-row items-center rounded-2xl border bg-card dark:bg-card-dark ${errors[field] ? 'border-red-500' : 'border-border dark:border-border-dark'}`}><TextInput {...props} className="flex-1 px-4 py-4 text-base text-foreground dark:text-foreground-dark" secureTextEntry={passwordField && !visible} value={value} onChangeText={(v) => { setValue(v); clearError(field); }} />{passwordField && <Pressable accessibilityLabel={visible ? 'Hide password' : 'Show password'} accessibilityRole="button" className="px-4 py-4" onPress={() => (field === 'password' ? setShowPassword : setShowConfirmation)((current) => !current)}><SymbolView name={{ ios: visible ? 'eye.slash' : 'eye', android: visible ? 'visibility_off' : 'visibility', web: visible ? 'visibility_off' : 'visibility' }} size={22} tintColor={palette.mutedForeground} /></Pressable>}</View>{!!errors[field] && <Text className="mt-2 text-sm text-red-500">{errors[field]}</Text>}</View>;
  };
  return <SafeAreaView className="flex-1 bg-background dark:bg-background-dark"><KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView contentContainerClassName="flex-grow justify-center px-6 py-10"><View className="mx-auto w-full max-w-md"><Text className="text-sm font-semibold uppercase tracking-[3px] text-muted-foreground dark:text-muted-foreground-dark">Get started</Text><Text className="mt-3 text-4xl font-bold text-foreground dark:text-foreground-dark">Create account</Text><View className="mt-10 gap-5">{input('Name', name, setName, 'name', { placeholder: 'First and last name', placeholderTextColor: palette.mutedForeground })}{input('Email', email, setEmail, 'email', { placeholder: 'you@example.com', placeholderTextColor: palette.mutedForeground, autoCapitalize: 'none', keyboardType: 'email-address' })}{input('Password', password, setPassword, 'password', { placeholder: 'Create a password', placeholderTextColor: palette.mutedForeground })}{input('Confirm password', confirmation, setConfirmation, 'confirmation', { placeholder: 'Repeat your password', placeholderTextColor: palette.mutedForeground })}</View>{!!formError && <Text className="mt-5 text-center text-sm text-red-500">{formError}</Text>}{!!notice && <Text className="mt-5 text-center text-sm text-foreground dark:text-foreground-dark">{notice}</Text>}<Pressable disabled={submitting} onPress={onSubmit} className="mt-8 items-center rounded-2xl bg-primary dark:bg-primary-dark py-4">{submitting ? <ActivityIndicator color={palette.primaryForeground} /> : <Text className="text-base font-bold text-primary-foreground dark:text-primary-foreground-dark">Create account</Text>}</Pressable><View className="mt-8 flex-row justify-center gap-1"><Text className="text-muted-foreground dark:text-muted-foreground-dark">Already have an account?</Text><Link href="/(auth)/login" asChild><Text className="font-semibold text-foreground dark:text-foreground-dark">Sign in</Text></Link></View></View></ScrollView></KeyboardAvoidingView></SafeAreaView>;
}
