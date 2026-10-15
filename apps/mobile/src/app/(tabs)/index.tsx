import { Redirect, router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { usePalette } from '@/hooks/use-palette';
import { useAuth } from '@/providers/auth-provider';

export default function HomeScreen() {
  const { user, isLoading, signOut } = useAuth();
  const palette = usePalette();

  async function onSignOut() {
    try {
      await signOut();
    } catch {
      // signOut always clears the local session, even when the server call fails
    }
    router.replace('/(auth)/login');
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background dark:bg-background-dark">
        <ActivityIndicator color={palette.foreground} />
      </SafeAreaView>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'there';

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark">
      <ScrollView contentContainerClassName="flex-grow px-6 py-10">
        <View className="w-full max-w-md self-center">
          <Pressable
            onPress={onSignOut}
            className="self-end rounded-2xl border border-border dark:border-border-dark bg-card dark:bg-card-dark px-4 py-2 active:bg-secondary dark:active:bg-secondary-dark">
            <Text className="text-sm font-semibold text-foreground dark:text-foreground-dark">Sign out</Text>
          </Pressable>

          <View className="mt-6 items-center">
            <Text className="text-sm font-semibold uppercase tracking-[3px] text-muted-foreground dark:text-muted-foreground-dark">
              Dashboard
            </Text>
            <Text className="mt-3 text-center text-4xl font-bold text-foreground dark:text-foreground-dark">
              Welcome back, {name}
            </Text>
            <Text className="mt-3 text-center text-base leading-6 text-muted-foreground dark:text-muted-foreground-dark">
              Signed in as {user.email}.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
