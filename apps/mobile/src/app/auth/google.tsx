import { Redirect } from 'expo-router';
import { ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { usePalette } from '@/hooks/use-palette';
import { useAuth } from '@/providers/auth-provider';

/**
 * Google sign-in ends on this deep link (myauthmobile://auth/google). The sign-in screen that opened
 * the browser trades the code for a session; on Android the link also opens this route, so it only
 * has to send the user on.
 */
export default function GoogleRedirectScreen() {
  const { user, isLoading } = useAuth();
  const palette = usePalette();

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background dark:bg-background-dark">
        <ActivityIndicator color={palette.foreground} />
      </SafeAreaView>
    );
  }

  return <Redirect href={user ? '/(auth)/dashboard' : '/(auth)/login'} />;
}
