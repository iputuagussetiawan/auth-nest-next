import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
      <SafeAreaView className="flex-1 items-center justify-center bg-[#f0fdf4] dark:bg-[#020c06]">
        <ActivityIndicator color="#10AF13" />
        <Text className="mt-3 text-[#166534] dark:text-[#6ee7b7]">Loading your dashboard...</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;

  return (
    <SafeAreaView className="flex-1 bg-[#f0fdf4] dark:bg-[#020c06]">
      <ScrollView contentContainerClassName="flex-grow px-6 py-10">
        <View className="mx-auto w-full max-w-md">
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <Text className="text-sm font-semibold uppercase tracking-[3px] text-[#10AF13]">Dashboard</Text>
              <Text className="mt-3 text-4xl font-bold text-[#052e16] dark:text-[#d1fae5]">Welcome back, {fullName}</Text>
              <Text className="mt-3 text-base leading-6 text-[#166534] dark:text-[#6ee7b7]">Signed in as {user.email}.</Text>
            </View>
            <Pressable disabled={isSigningOut} onPress={onSignOut} className="mt-1 rounded-2xl border border-emerald-300 bg-white px-4 py-2 active:bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950 dark:active:bg-emerald-900">
              {isSigningOut ? <ActivityIndicator color="#10AF13" /> : <Text className="text-sm font-semibold text-[#10AF13]">Sign out</Text>}
            </Pressable>
          </View>
          {!!signOutError && <Text className="mt-3 text-sm text-red-600">{signOutError}</Text>}

          <View className="mt-10 flex-row gap-3">
            {stats.map((stat) => (
              <View key={stat.label} className="flex-1 rounded-2xl border border-emerald-300 bg-white p-4 dark:border-emerald-900 dark:bg-emerald-950">
                <Text className="text-3xl font-bold text-[#10AF13]">{stat.value}</Text>
                <Text className="mt-1 text-sm font-medium text-[#166534] dark:text-[#6ee7b7]">{stat.label}</Text>
              </View>
            ))}
          </View>

          <Text className="mt-10 text-lg font-bold text-[#052e16] dark:text-[#d1fae5]">Recent activity</Text>
          <View className="mt-4 gap-3">
            {activity.map((item) => (
              <View key={item.label} className="flex-row items-center rounded-2xl border border-emerald-300 bg-white p-4 dark:border-emerald-900 dark:bg-emerald-950">
                <View className="mr-3 h-2 w-2 rounded-full bg-[#10AF13]" />
                <Text className="flex-1 text-sm font-medium text-[#052e16] dark:text-[#d1fae5]">{item.label}</Text>
                <Text className="text-xs text-[#166534] dark:text-[#6ee7b7]">{item.time}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
