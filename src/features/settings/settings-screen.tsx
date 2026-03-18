import Env from 'env';
import * as React from 'react';
import { useUniwind } from 'uniwind';

import {
  colors,
  FocusAwareStatusBar,
  Pressable,
  ScrollView,
  Text,
  View,
} from '@/components/ui';
import { Github, Rate, Share, Support, Website } from '@/components/ui/icons';
import { showErrorMessage } from '@/components/ui/utils';
import { connectGoogleCalendarOAuth } from '@/features/auth/oauth';
import { useAuthStore as useAuth } from '@/features/auth/use-auth-store';
import { translate } from '@/lib/i18n';
import { useProfile } from './api';
import { LanguageItem } from './components/language-item';
import { SettingsContainer } from './components/settings-container';
import { SettingsItem } from './components/settings-item';
import { ThemeItem } from './components/theme-item';
import { getGeminiKey } from './use-gemini-key';

export function SettingsScreen() {
  const signOut = useAuth.use.signOut();
  const session = useAuth.use.session();
  const { data: profile } = useProfile();
  const { theme } = useUniwind();
  const iconColor
    = theme === 'dark' ? colors.neutral[400] : colors.neutral[500];

  const geminiKey = getGeminiKey();
  const [isConnectingCalendar, setIsConnectingCalendar] = React.useState(false);

  const isGoogleConnected = Boolean(session?.provider_token);

  const handleConnectCalendar = async () => {
    if (isConnectingCalendar)
      return;
    setIsConnectingCalendar(true);
    try {
      await connectGoogleCalendarOAuth();
    }
    catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to connect Google Calendar';
      showErrorMessage(message);
    }
    finally {
      setIsConnectingCalendar(false);
    }
  };

  return (
    <>
      <FocusAwareStatusBar />

      <ScrollView>
        <View className="flex-1 px-4 pt-4">
          <SettingsContainer title="settings.account">
            <SettingsItem
              text="settings.email"
              value={session?.user?.email ?? '—'}
            />
            <SettingsItem
              text="settings.name"
              value={profile?.display_name ?? '—'}
            />
          </SettingsContainer>

          <SettingsContainer title="settings.generale">
            <LanguageItem />
            <ThemeItem />
          </SettingsContainer>

          <SettingsContainer title="settings.ai">
            <SettingsItem
              text="settings.gemini_key"
              value={geminiKey ? '••••••' : 'Not set'}
            />
            <View className="px-4 py-2">
              <Text className="text-sm text-neutral-500 dark:text-neutral-300">
                Calendar
              </Text>
              <Text className="mt-1">
                {isGoogleConnected
                  ? 'Google Calendar connected'
                  : 'Connect your Google Calendar (read-only) to show today’s events.'}
              </Text>
              {!isGoogleConnected && (
                <Pressable
                  onPress={handleConnectCalendar}
                  disabled={isConnectingCalendar}
                  className="mt-3 items-center rounded-xl bg-primary-600 px-4 py-3 disabled:opacity-60"
                >
                  <Text className="font-semibold text-white">
                    {isConnectingCalendar ? 'Connecting…' : 'Connect Google Calendar'}
                  </Text>
                </Pressable>
              )}
            </View>
          </SettingsContainer>

          <SettingsContainer title="settings.about">
            <SettingsItem
              text="settings.app_name"
              value={Env.EXPO_PUBLIC_NAME}
            />
            <SettingsItem
              text="settings.version"
              value={Env.EXPO_PUBLIC_VERSION}
            />
          </SettingsContainer>

          <SettingsContainer title="settings.support_us">
            <SettingsItem
              text="settings.share"
              icon={<Share color={iconColor} />}
              onPress={() => {}}
            />
            <SettingsItem
              text="settings.rate"
              icon={<Rate color={iconColor} />}
              onPress={() => {}}
            />
            <SettingsItem
              text="settings.support"
              icon={<Support color={iconColor} />}
              onPress={() => {}}
            />
          </SettingsContainer>

          <SettingsContainer title="settings.links">
            <SettingsItem text="settings.privacy" onPress={() => {}} />
            <SettingsItem text="settings.terms" onPress={() => {}} />
            <SettingsItem
              text="settings.github"
              icon={<Github color={iconColor} />}
              onPress={() => {}}
            />
            <SettingsItem
              text="settings.website"
              icon={<Website color={iconColor} />}
              onPress={() => {}}
            />
          </SettingsContainer>

          <View className="my-8">
            <SettingsContainer>
              <SettingsItem text="settings.logout" onPress={signOut} />
            </SettingsContainer>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
