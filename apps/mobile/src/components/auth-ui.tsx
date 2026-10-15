import { useState, type ReactNode, type Ref } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View, type TextInputProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import Svg, { Path } from 'react-native-svg';

import { usePalette } from '@/hooks/use-palette';

// Building blocks shared by the sign-in and sign-up screens, in the web app's Monochrome theme.

export function AuthScreen({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerClassName="flex-grow justify-center px-6 py-10" keyboardShouldPersistTaps="handled">
          <View className="mx-auto w-full max-w-md">{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function AuthHeader({ icon, title, subtitle }: { icon: SymbolViewProps['name']; title: string; subtitle: string }) {
  const palette = usePalette();
  return (
    <View className="items-center">
      <View className="h-16 w-16 items-center justify-center rounded-3xl bg-primary dark:bg-primary-dark">
        <SymbolView name={icon} size={32} tintColor={palette.primaryForeground} />
      </View>
      <Text className="mt-6 w-full text-center text-3xl font-bold text-foreground dark:text-foreground-dark">{title}</Text>
      <Text className="mt-2 w-full text-center text-base text-muted-foreground dark:text-muted-foreground-dark">{subtitle}</Text>
    </View>
  );
}

export function AuthCard({ children }: { children: ReactNode }) {
  return <View className="mt-8 rounded-3xl border border-border bg-card p-5 dark:border-border-dark dark:bg-card-dark">{children}</View>;
}

type FieldProps = TextInputProps & {
  label: string;
  icon: SymbolViewProps['name'];
  error?: string;
  /** Shown under the input when there is no error */
  hint?: string;
  inputRef?: Ref<TextInput>;
  trailing?: ReactNode;
  /** Set to flex-1 when fields sit side by side */
  containerClassName?: string;
};

export function Field({ label, icon, error, hint, inputRef, trailing, containerClassName, onFocus, onBlur, ...input }: FieldProps) {
  const palette = usePalette();
  const [focused, setFocused] = useState(false);
  const border = error ? 'border-red-500' : focused ? 'border-ring dark:border-ring-dark' : 'border-border dark:border-border-dark';

  return (
    <View className={containerClassName}>
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
      {error ? (
        <Text className="mt-2 text-sm text-red-500 dark:text-red-400">{error}</Text>
      ) : (
        !!hint && <Text className="mt-2 text-xs text-muted-foreground dark:text-muted-foreground-dark">{hint}</Text>
      )}
    </View>
  );
}

export function PasswordToggle({ visible, onToggle }: { visible: boolean; onToggle: () => void }) {
  const palette = usePalette();
  return (
    <Pressable accessibilityLabel={visible ? 'Hide password' : 'Show password'} accessibilityRole="button" hitSlop={8} className="px-4 py-4" onPress={onToggle}>
      <SymbolView
        name={{ ios: visible ? 'eye.slash' : 'eye', android: visible ? 'visibility_off' : 'visibility', web: visible ? 'visibility_off' : 'visibility' }}
        size={22}
        tintColor={palette.mutedForeground}
      />
    </Pressable>
  );
}

export function FormAlert({ message }: { message: string }) {
  if (!message) return null;
  return (
    <View accessibilityRole="alert" className="mb-5 flex-row items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
      <SymbolView name={{ ios: 'exclamationmark.circle.fill', android: 'error', web: 'error' }} size={20} tintColor="#ef4444" />
      <Text className="flex-1 text-sm text-red-700 dark:text-red-300">{message}</Text>
    </View>
  );
}

type ButtonProps = { label: string; busyLabel: string; busy: boolean; disabled: boolean; onPress: () => void };

export function PrimaryButton({ label, busyLabel, busy, disabled, onPress }: ButtonProps) {
  const palette = usePalette();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled, busy }}
      disabled={disabled}
      onPress={onPress}
      className={`h-14 flex-row items-center justify-center gap-2 rounded-2xl bg-primary active:opacity-80 dark:bg-primary-dark ${busy ? 'opacity-80' : ''}`}>
      {busy && <ActivityIndicator color={palette.primaryForeground} />}
      <Text className="text-base font-bold text-primary-foreground dark:text-primary-foreground-dark">{busy ? busyLabel : label}</Text>
    </Pressable>
  );
}

export function OrDivider() {
  return (
    <View className="my-6 flex-row items-center gap-3">
      <View className="h-px flex-1 bg-border dark:bg-border-dark" />
      <Text className="text-xs font-medium uppercase tracking-wide text-muted-foreground dark:text-muted-foreground-dark">or</Text>
      <View className="h-px flex-1 bg-border dark:bg-border-dark" />
    </View>
  );
}

export function GoogleButton({ busy, disabled, onPress }: { busy: boolean; disabled: boolean; onPress: () => void }) {
  const palette = usePalette();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled, busy }}
      disabled={disabled}
      onPress={onPress}
      className="h-14 flex-row items-center justify-center gap-3 rounded-2xl border border-border bg-card active:bg-secondary dark:border-border-dark dark:bg-card-dark dark:active:bg-secondary-dark">
      <Svg width={20} height={20} viewBox="0 0 24 24">
        <Path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.57 5.57 0 0 1-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
        <Path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24z" />
        <Path fill="#FBBC05" d="M5.27 14.29A7.2 7.2 0 0 1 4.89 12c0-.8.14-1.57.38-2.29V6.62H1.29a11.99 11.99 0 0 0 0 10.76l3.98-3.09z" />
        <Path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.69 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
      </Svg>
      {busy && <ActivityIndicator color={palette.foreground} />}
      <Text className="text-base font-semibold text-foreground dark:text-foreground-dark">{busy ? 'Waiting for Google...' : 'Continue with Google'}</Text>
    </Pressable>
  );
}
