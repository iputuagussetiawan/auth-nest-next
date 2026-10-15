import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { usePalette } from '@/hooks/use-palette';
import { useAuth } from '@/providers/auth-provider';

const stats = [
  { value: '128', label: 'Total' },
  { value: '42', label: 'Done' },
  { value: '9', label: 'Due' },
];

const activity = [
  { label: 'Quarterly report submitted', time: '2m ago' },
  { label: 'Design review completed', time: '1h ago' },
  { label: 'New teammate onboarded', time: '3h ago' },
  { label: 'Sprint 24 closed', time: 'Yesterday' },
];

export default function DashboardScreen() {
  const { user, isLoading, signOut } = useAuth();
  const palette = usePalette();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState('');

  async function onSignOut() {
    if (isSigningOut) return;
    setIsSigningOut(true);
    setSignOutError('');
    try {
      await signOut();
      router.replace('/(auth)/login');
    } catch (error) {
      setSignOutError(error instanceof Error ? error.message : 'Unable to sign out.');
      setIsSigningOut(false);
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background dark:bg-background-dark">
        <ActivityIndicator color={palette.foreground} />
        <Text className="mt-3 text-muted-foreground dark:text-muted-foreground-dark">Loading your dashboard...</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark">
      <ScrollView contentContainerClassName="flex-grow px-6 py-10">
        <View className="mx-auto w-full max-w-md">
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <Text className="text-sm font-semibold uppercase tracking-[3px] text-muted-foreground dark:text-muted-foreground-dark">Dashboard</Text>
              <Text className="mt-3 text-4xl font-bold text-foreground dark:text-foreground-dark">Welcome back, {fullName}</Text>
              <Text className="mt-3 text-base leading-6 text-muted-foreground dark:text-muted-foreground-dark">Signed in as {user.email}.</Text>
            </View>
            <Pressable disabled={isSigningOut} onPress={onSignOut} className="mt-1 rounded-2xl border border-border dark:border-border-dark bg-card dark:bg-card-dark px-4 py-2 active:bg-secondary dark:active:bg-secondary-dark">
              {isSigningOut ? <ActivityIndicator color={palette.foreground} /> : <Text className="text-sm font-semibold text-foreground dark:text-foreground-dark">Sign out</Text>}
            </Pressable>
          </View>
          {!!signOutError && <Text className="mt-3 text-sm text-red-600">{signOutError}</Text>}

          <View className="mt-10 flex-row gap-3">
            {stats.map((stat) => (
              <View key={stat.label} className="flex-1 rounded-2xl border border-border dark:border-border-dark bg-card dark:bg-card-dark p-4">
                <Text className="text-3xl font-bold text-foreground dark:text-foreground-dark">{stat.value}</Text>
                <Text className="mt-1 text-sm font-medium text-muted-foreground dark:text-muted-foreground-dark">{stat.label}</Text>
              </View>
            ))}
          </View>

          <Text className="mt-10 text-lg font-bold text-foreground dark:text-foreground-dark">Recent activity</Text>
          <View className="mt-4 gap-3">
            {activity.map((item) => (
              <View key={item.label} className="flex-row items-center rounded-2xl border border-border dark:border-border-dark bg-card dark:bg-card-dark p-4">
                <View className="mr-3 h-2 w-2 rounded-full bg-accent dark:bg-accent-dark" />
                <Text className="flex-1 text-sm font-medium text-foreground dark:text-foreground-dark">{item.label}</Text>
                <Text className="text-xs text-muted-foreground dark:text-muted-foreground-dark">{item.time}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
