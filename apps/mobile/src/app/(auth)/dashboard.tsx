import { Image } from 'expo-image';
import { Redirect, router } from 'expo-router';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormAlert } from '@/components/auth-ui';
import { usePalette } from '@/hooks/use-palette';
import { accountApi, type Profile, type Session } from '@/lib/account-api';
import { useAuth } from '@/providers/auth-provider';

function timeAgo(value: string | null) {
  if (!value) return 'never';
  const seconds = Math.max(0, (Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const units: [number, string][] = [
    [60 * 60 * 24 * 365, 'year'],
    [60 * 60 * 24 * 30, 'month'],
    [60 * 60 * 24, 'day'],
    [60 * 60, 'hour'],
    [60, 'minute'],
  ];
  const [size, unit] = units.find(([s]) => seconds >= s)!;
  const n = Math.floor(seconds / size);
  return `${n} ${unit}${n === 1 ? '' : 's'} ago`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

/** The API parses browser user agents; requests from this app show up as okhttp (Android) or CFNetwork (iOS) */
function describeSession(session: Session): { title: string; icon: SymbolViewProps['name'] } {
  const ua = session.userAgent ?? '';
  if (/okhttp/i.test(ua)) return { title: 'Mobile app · Android', icon: { ios: 'iphone', android: 'smartphone', web: 'smartphone' } };
  if (/CFNetwork|Darwin/i.test(ua)) return { title: 'Mobile app · iOS', icon: { ios: 'iphone', android: 'smartphone', web: 'smartphone' } };

  const known = [session.browser, session.os].filter((part) => part && part !== 'Unknown');
  const mobile = session.device === 'mobile' || session.device === 'tablet';
  return {
    title: known.join(' · ') || 'Unknown device',
    icon: mobile ? { ios: 'iphone', android: 'smartphone', web: 'smartphone' } : { ios: 'laptopcomputer', android: 'laptop', web: 'laptop' },
  };
}

function Avatar({ profile }: { profile: Profile }) {
  const initials = [profile.firstName, profile.lastName]
    .map((part) => part?.trim()[0])
    .filter(Boolean)
    .join('')
    .toUpperCase() || profile.email[0].toUpperCase();

  if (profile.profilePicture) {
    return <Image source={{ uri: profile.profilePicture }} style={{ width: 88, height: 88, borderRadius: 44 }} contentFit="cover" accessibilityLabel="Profile picture" />;
  }
  return (
    <View className="h-[88px] w-[88px] items-center justify-center rounded-full bg-primary dark:bg-primary-dark">
      <Text className="text-3xl font-bold text-primary-foreground dark:text-primary-foreground-dark">{initials}</Text>
    </View>
  );
}

function Card({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <View className="mt-6 rounded-3xl border border-border bg-card p-5 dark:border-border-dark dark:bg-card-dark">
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-base font-bold text-foreground dark:text-foreground-dark">{title}</Text>
        {action}
      </View>
      {children}
    </View>
  );
}

function DetailRow({ icon, label, value, last }: { icon: SymbolViewProps['name']; label: string; value: string; last?: boolean }) {
  const palette = usePalette();
  return (
    <View className={`flex-row items-center gap-3 py-3 ${last ? '' : 'border-b border-border dark:border-border-dark'}`}>
      <SymbolView name={icon} size={18} tintColor={palette.mutedForeground} />
      <Text className="flex-1 text-sm text-muted-foreground dark:text-muted-foreground-dark">{label}</Text>
      <Text className="text-sm font-medium text-foreground dark:text-foreground-dark">{value}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const { user, isLoading, signOut } = useAuth();
  const palette = usePalette();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadError, setLoadError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [busySession, setBusySession] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const load = useCallback(async () => {
    try {
      const result = await accountApi.profile();
      setProfile(result.data);
      setLoadError('');
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Could not load your account.');
    }
  }, []);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  function confirmRevoke(session: Session | 'others') {
    const others = session === 'others';
    Alert.alert(
      others ? 'Sign out other devices?' : 'Sign out this device?',
      others ? 'Every device except this one will need to sign in again.' : `${describeSession(session).title} will need to sign in again.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out',
          style: 'destructive',
          onPress: async () => {
            setBusySession(others ? 'others' : session.id);
            try {
              await (others ? accountApi.revokeOtherSessions() : accountApi.revokeSession(session.id));
              await load();
            } catch (error) {
              setLoadError(error instanceof Error ? error.message : 'Could not sign out that device.');
            } finally {
              setBusySession(null);
            }
          },
        },
      ],
    );
  }

  async function onSignOut() {
    if (isSigningOut) return;
    setIsSigningOut(true);
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
        <Text className="mt-3 text-muted-foreground dark:text-muted-foreground-dark">Loading your dashboard...</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;
  const sessions = [...(profile?.sessions ?? [])].sort((a, b) => Number(b.isCurrent) - Number(a.isCurrent));
  const otherCount = sessions.filter((s) => !s.isCurrent).length;

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark">
      <ScrollView
        contentContainerClassName="flex-grow px-6 py-8"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={palette.mutedForeground} />}>
        <View className="mx-auto w-full max-w-md">
          <Pressable
            accessibilityRole="button"
            disabled={isSigningOut}
            onPress={onSignOut}
            className="flex-row items-center gap-2 self-end rounded-2xl border border-border bg-card px-4 py-2 active:bg-secondary dark:border-border-dark dark:bg-card-dark dark:active:bg-secondary-dark">
            {isSigningOut ? (
              <ActivityIndicator color={palette.foreground} />
            ) : (
              <SymbolView name={{ ios: 'rectangle.portrait.and.arrow.right', android: 'logout', web: 'logout' }} size={16} tintColor={palette.foreground} />
            )}
            <Text className="text-sm font-semibold text-foreground dark:text-foreground-dark">Sign out</Text>
          </Pressable>

          <View className="mt-4 items-center">
            {profile ? (
              <Avatar profile={profile} />
            ) : (
              <View className="h-[88px] w-[88px] rounded-full bg-secondary dark:bg-secondary-dark" />
            )}
            <Text className="mt-4 w-full text-center text-sm font-semibold uppercase tracking-[3px] text-muted-foreground dark:text-muted-foreground-dark">Dashboard</Text>
            <Text className="mt-2 w-full text-center text-3xl font-bold text-foreground dark:text-foreground-dark">Welcome back, {user.firstName || fullName}</Text>
            <Text className="mt-2 w-full text-center text-base text-muted-foreground dark:text-muted-foreground-dark">{user.email}</Text>
            {!!profile?.role && (
              <View className="mt-3 rounded-full bg-secondary px-3 py-1 dark:bg-secondary-dark">
                <Text className="text-xs font-semibold capitalize text-foreground dark:text-foreground-dark">{profile.role.replace(/_/g, ' ')}</Text>
              </View>
            )}
          </View>

          {!!loadError && (
            <View className="mt-6">
              <FormAlert message={loadError} />
            </View>
          )}

          {!profile && !loadError ? (
            <ActivityIndicator className="mt-10" color={palette.mutedForeground} />
          ) : (
            profile && (
              <>
                <View className="mt-8 flex-row gap-3">
                  <View className="flex-1 rounded-2xl border border-border bg-card p-4 dark:border-border-dark dark:bg-card-dark">
                    <Text className="text-2xl font-bold text-foreground dark:text-foreground-dark">{sessions.length}</Text>
                    <Text className="mt-1 text-xs font-medium text-muted-foreground dark:text-muted-foreground-dark">Active {sessions.length === 1 ? 'device' : 'devices'}</Text>
                  </View>
                  <View className="flex-1 rounded-2xl border border-border bg-card p-4 dark:border-border-dark dark:bg-card-dark">
                    <Text className={`text-2xl font-bold ${profile.isEmailVerified ? 'text-foreground dark:text-foreground-dark' : 'text-red-500'}`}>{profile.isEmailVerified ? 'Yes' : 'No'}</Text>
                    <Text className="mt-1 text-xs font-medium text-muted-foreground dark:text-muted-foreground-dark">Email verified</Text>
                  </View>
                  <View className="flex-1 rounded-2xl border border-border bg-card p-4 dark:border-border-dark dark:bg-card-dark">
                    <Text className="text-2xl font-bold capitalize text-foreground dark:text-foreground-dark">{profile.provider === 'google' ? 'Google' : 'Email'}</Text>
                    <Text className="mt-1 text-xs font-medium text-muted-foreground dark:text-muted-foreground-dark">Sign-in method</Text>
                  </View>
                </View>

                <Card title="Account">
                  <DetailRow icon={{ ios: 'person', android: 'person', web: 'person' }} label="Name" value={fullName} />
                  <DetailRow icon={{ ios: 'calendar', android: 'calendar_today', web: 'calendar_today' }} label="Member since" value={formatDate(profile.createdAt)} />
                  <DetailRow icon={{ ios: 'clock', android: 'schedule', web: 'schedule' }} label="Last sign-in" value={timeAgo(profile.lastLogin)} last />
                </Card>

                <Card
                  title="Signed-in devices"
                  action={
                    otherCount > 0 && (
                      <Pressable accessibilityRole="button" hitSlop={8} disabled={busySession !== null} onPress={() => confirmRevoke('others')}>
                        {busySession === 'others' ? <ActivityIndicator color={palette.foreground} /> : <Text className="text-sm font-semibold text-red-500">Sign out others</Text>}
                      </Pressable>
                    )
                  }>
                  {sessions.map((session, index) => {
                    const { title, icon } = describeSession(session);
                    return (
                      <View key={session.id} className={`flex-row items-center gap-3 py-3 ${index === sessions.length - 1 ? '' : 'border-b border-border dark:border-border-dark'}`}>
                        <View className="h-10 w-10 items-center justify-center rounded-xl bg-secondary dark:bg-secondary-dark">
                          <SymbolView name={icon} size={20} tintColor={palette.foreground} />
                        </View>
                        <View className="flex-1">
                          <View className="flex-row items-center gap-2">
                            <Text className="flex-shrink text-sm font-semibold text-foreground dark:text-foreground-dark" numberOfLines={1}>{title}</Text>
                            {session.isCurrent && (
                              <View className="rounded-full bg-accent px-2 py-0.5 dark:bg-accent-dark">
                                <Text className="text-[10px] font-bold text-accent-foreground dark:text-accent-foreground-dark">THIS DEVICE</Text>
                              </View>
                            )}
                          </View>
                          <Text className="mt-0.5 text-xs text-muted-foreground dark:text-muted-foreground-dark" numberOfLines={1}>
                            {[session.ipAddress, `active ${timeAgo(session.lastActiveAt)}`].filter(Boolean).join(' · ')}
                          </Text>
                        </View>
                        {!session.isCurrent && (
                          <Pressable accessibilityRole="button" accessibilityLabel={`Sign out ${title}`} hitSlop={8} disabled={busySession !== null} onPress={() => confirmRevoke(session)}>
                            {busySession === session.id ? (
                              <ActivityIndicator color={palette.foreground} />
                            ) : (
                              <SymbolView name={{ ios: 'xmark.circle', android: 'cancel', web: 'cancel' }} size={22} tintColor={palette.mutedForeground} />
                            )}
                          </Pressable>
                        )}
                      </View>
                    );
                  })}
                </Card>

                <Text className="mt-6 text-center text-xs text-muted-foreground dark:text-muted-foreground-dark">Pull down to refresh</Text>
              </>
            )
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
