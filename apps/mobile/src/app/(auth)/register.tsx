import { Link, router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { AuthCard, AuthHeader, AuthScreen, Field, FormAlert, GoogleButton, OrDivider, PasswordToggle, PrimaryButton } from '@/components/auth-ui';
import { usePalette } from '@/hooks/use-palette';
import { validateEmail, validatePassword, validateRequired, type FormErrors } from '@/lib/validation';
import { useAuth } from '@/providers/auth-provider';

// Same limits as the API (packages/shared/src/auth.ts)
const NAME_MAX_LENGTH = 50;
const PASSWORD_MAX_LENGTH = 72;

function validateName(value: string, label: string) {
  return validateRequired(value, label) || (value.trim().length > NAME_MAX_LENGTH ? `${label} must be at most ${NAME_MAX_LENGTH} characters.` : '');
}

export default function RegisterScreen() {
  const { signUp, signInWithGoogle } = useAuth();
  const palette = usePalette();
  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmationRef = useRef<TextInput>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [sentTo, setSentTo] = useState('');
  const busy = submitting || googleBusy;

  function update(field: string, setValue: (value: string) => void) {
    return (value: string) => {
      setValue(value);
      setErrors((prev) => (prev[field] ? { ...prev, [field]: '' } : prev));
      setFormError('');
    };
  }

  async function onSubmit() {
    if (busy) return;
    const next: FormErrors = {
      firstName: validateName(firstName, 'First name'),
      lastName: validateName(lastName, 'Last name'),
      email: validateEmail(email),
      password: validatePassword(password) || (password.length > PASSWORD_MAX_LENGTH ? `Password must be at most ${PASSWORD_MAX_LENGTH} characters.` : ''),
      confirmation: !confirmation ? 'Please confirm your password.' : confirmation !== password ? 'Passwords do not match.' : '',
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setSubmitting(true);
    try {
      await signUp({ firstName: firstName.trim(), lastName: lastName.trim(), email, password });
      setSentTo(email.trim().toLowerCase());
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Sign up failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function onGoogle() {
    if (busy) return;
    setFormError('');
    setGoogleBusy(true);
    try {
      // Google sign-in creates the account on first use, already verified
      if (await signInWithGoogle()) router.replace('/(auth)/dashboard');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Google sign-in failed. Please try again.');
    } finally {
      setGoogleBusy(false);
    }
  }

  if (sentTo) {
    return (
      <AuthScreen>
        <AuthHeader icon={{ ios: 'envelope.badge', android: 'mark_email_unread', web: 'mark_email_unread' }} title="Check your email" subtitle="One more step to finish setting up your account." />
        <AuthCard>
          <Text className="text-center text-base leading-6 text-foreground dark:text-foreground-dark">
            We&apos;ve sent an email to <Text className="font-semibold">{sentTo}</Text>. Follow the link in it to continue.
          </Text>
          <View className="mt-5 flex-row items-start gap-3 rounded-2xl bg-secondary p-4 dark:bg-secondary-dark">
            <SymbolView name={{ ios: 'info.circle', android: 'info', web: 'info' }} size={18} tintColor={palette.mutedForeground} />
            <Text className="flex-1 text-sm text-muted-foreground dark:text-muted-foreground-dark">
              Didn&apos;t get it? Check your spam folder, or wait a few minutes before trying again.
            </Text>
          </View>
          <View className="mt-6">
            <PrimaryButton label="Back to sign in" busyLabel="" busy={false} disabled={false} onPress={() => router.replace('/(auth)/login')} />
          </View>
        </AuthCard>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen>
      <AuthHeader icon={{ ios: 'person.crop.circle.badge.plus', android: 'person_add', web: 'person_add' }} title="Create your account" subtitle="Get started in less than a minute." />

      <AuthCard>
        <FormAlert message={formError} />

        <View className="gap-5">
          <View className="flex-row gap-3">
            <Field
              containerClassName="flex-1"
              label="First name"
              icon={{ ios: 'person', android: 'person', web: 'person' }}
              error={errors.firstName}
              placeholder="Jane"
              autoCapitalize="words"
              autoComplete="given-name"
              textContentType="givenName"
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => lastNameRef.current?.focus()}
              editable={!busy}
              value={firstName}
              onChangeText={update('firstName', setFirstName)}
            />
            <Field
              containerClassName="flex-1"
              label="Last name"
              icon={{ ios: 'person', android: 'person', web: 'person' }}
              inputRef={lastNameRef}
              error={errors.lastName}
              placeholder="Doe"
              autoCapitalize="words"
              autoComplete="family-name"
              textContentType="familyName"
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => emailRef.current?.focus()}
              editable={!busy}
              value={lastName}
              onChangeText={update('lastName', setLastName)}
            />
          </View>
          <Field
            label="Email"
            icon={{ ios: 'envelope', android: 'mail', web: 'mail' }}
            inputRef={emailRef}
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
            onChangeText={update('email', setEmail)}
          />
          <Field
            label="Password"
            icon={{ ios: 'lock', android: 'lock', web: 'lock' }}
            inputRef={passwordRef}
            error={errors.password}
            hint="At least 8 characters."
            placeholder="Create a password"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            textContentType="newPassword"
            secureTextEntry={!showPassword}
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => confirmationRef.current?.focus()}
            editable={!busy}
            value={password}
            onChangeText={update('password', setPassword)}
            trailing={<PasswordToggle visible={showPassword} onToggle={() => setShowPassword((v) => !v)} />}
          />
          <Field
            label="Confirm password"
            icon={{ ios: 'lock.rotation', android: 'lock_reset', web: 'lock_reset' }}
            inputRef={confirmationRef}
            error={errors.confirmation}
            placeholder="Repeat your password"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            textContentType="newPassword"
            secureTextEntry={!showConfirmation}
            returnKeyType="go"
            onSubmitEditing={onSubmit}
            editable={!busy}
            value={confirmation}
            onChangeText={update('confirmation', setConfirmation)}
            trailing={<PasswordToggle visible={showConfirmation} onToggle={() => setShowConfirmation((v) => !v)} />}
          />
        </View>

        <View className="mt-6">
          <PrimaryButton label="Create account" busyLabel="Creating account..." busy={submitting} disabled={busy} onPress={onSubmit} />
        </View>

        <OrDivider />
        <GoogleButton busy={googleBusy} disabled={busy} onPress={onGoogle} />
      </AuthCard>

      <View className="mt-8 flex-row justify-center gap-1">
        <Text className="text-muted-foreground dark:text-muted-foreground-dark">Already have an account?</Text>
        <Link href="/(auth)/login" asChild>
          <Pressable accessibilityRole="link" hitSlop={8}>
            <Text className="font-semibold text-foreground dark:text-foreground-dark">Sign in</Text>
          </Pressable>
        </Link>
      </View>
    </AuthScreen>
  );
}
