import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/providers/auth-provider';

export default function HomeScreen() {
  const { user, signOut } = useAuth();

  async function onSignOut() {
    await signOut();
    router.replace('/(auth)/login');
  }

  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'there';

  return (
    <SafeAreaView className="flex-1 bg-[#f0fdf4] dark:bg-[#020c06]">
      <ScrollView contentContainerClassName="flex-grow px-6 py-10">
        <View className="w-full max-w-md self-center">
          <View className="flex-row items-start justify-between">
            <View className="mr-3 flex-1">
              <Text className="text-sm font-semibold uppercase tracking-[3px] text-[#10AF13]">
                Dashboard
              </Text>
              <Text className="mt-3 text-4xl font-bold text-[#052e16] dark:text-[#d1fae5]">
                Welcome back, {name}
              </Text>
              <Text className="mt-3 text-base leading-6 text-[#166534] dark:text-[#6ee7b7]">
                Signed in as {user?.email ?? 'your account'}.
              </Text>
            </View>
            <Pressable
              disabled={!user}
              onPress={onSignOut}
              className="mt-1 rounded-2xl border border-emerald-300 bg-white px-4 py-2 dark:border-emerald-900 dark:bg-emerald-950">
              <Text className="text-sm font-semibold text-[#10AF13]">Sign out</Text>
            </Pressable>
          </View>

          {!user && (
            <Text className="mt-8 text-base text-red-600">
              No authenticated user loaded. Please sign in again.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
