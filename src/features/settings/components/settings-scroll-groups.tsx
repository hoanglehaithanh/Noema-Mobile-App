import type { Session } from '@supabase/supabase-js';
import type { Profile } from '@/types';

import Env from 'env';
import * as React from 'react';

import { Image, Pressable, Text, View } from '@/components/ui';
import { Github, Rate, Share, Support, Website } from '@/components/ui/icons';
import { getGoogleAvatarUrl, getGoogleFullName } from '@/features/settings/google-account-details';
import { translate } from '@/lib/i18n';

import { LanguageItem } from './language-item';
import { SettingsContainer } from './settings-container';
import { SettingsItem } from './settings-item';
import { ThemeItem } from './theme-item';

type AccountProps = {
  session: Session | null;
  profile: Profile | null | undefined;
};

export function SettingsAccountGroup({ session, profile }: AccountProps) {
  const user = session?.user;
  const avatarUrl = getGoogleAvatarUrl(user);
  const displayName
    = profile?.display_name?.trim()
      || getGoogleFullName(user)
      || '—';

  return (
    <SettingsContainer title="settings.account">
      {avatarUrl.startsWith('http') && (
        <View className="items-center border-b border-neutral-100 py-4 dark:border-neutral-800">
          <Image
            source={{ uri: avatarUrl }}
            className="size-20 rounded-full bg-neutral-200 dark:bg-neutral-700"
            accessibilityLabel={translate('settings.profile_photo')}
          />
        </View>
      )}
      <SettingsItem
        text="settings.email"
        value={session?.user?.email ?? '—'}
      />
      <SettingsItem
        text="settings.name"
        value={displayName}
        isLast
      />
    </SettingsContainer>
  );
}

export function SettingsGeneralGroup() {
  return (
    <SettingsContainer title="settings.generale">
      <LanguageItem />
      <ThemeItem isLast />
    </SettingsContainer>
  );
}

type AiProps = {
  geminiKey: string | null;
  isCheckingCalendarSync: boolean;
  calendarCanSync: boolean;
  calendarSuggestReconnect: boolean;
  isConnectingCalendar: boolean;
  onConnectCalendar: () => void;
};

export function SettingsAiGroup({
  geminiKey,
  isCheckingCalendarSync,
  calendarCanSync,
  calendarSuggestReconnect,
  isConnectingCalendar,
  onConnectCalendar,
}: AiProps) {
  const calendarMessageTx = (() => {
    if (isCheckingCalendarSync)
      return 'settings.calendar_checking' as const;
    if (calendarCanSync)
      return 'settings.calendar_connected' as const;
    if (calendarSuggestReconnect)
      return 'settings.calendar_reconnect_suggestion' as const;
    return 'settings.calendar_disconnected' as const;
  })();

  const connectButtonTx = calendarSuggestReconnect
    ? ('settings.reconnect_google_calendar' as const)
    : ('settings.connect_google_calendar' as const);

  return (
    <SettingsContainer title="settings.ai">
      <SettingsItem
        text="settings.gemini_key"
        value={geminiKey ? '••••••' : translate('settings.not_set')}
      />
      <View className="border-t border-neutral-100 p-4 dark:border-neutral-800">
        <Text
          className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase"
          tx="settings.calendar_label"
        />
        <Text className="mt-2 text-sm/relaxed text-muted-foreground" tx={calendarMessageTx} />
        {!calendarCanSync && !isCheckingCalendarSync && (
          <Pressable
            onPress={onConnectCalendar}
            disabled={isConnectingCalendar}
            className="mt-4 items-center rounded-full bg-primary-500 px-5 py-3 disabled:opacity-60"
          >
            <Text className="font-semibold text-white">
              {translate(
                isConnectingCalendar
                  ? 'settings.connecting_calendar'
                  : connectButtonTx,
              )}
            </Text>
          </Pressable>
        )}
      </View>
    </SettingsContainer>
  );
}

export function SettingsAboutGroup() {
  return (
    <SettingsContainer title="settings.about">
      <SettingsItem
        text="settings.app_name"
        value={Env.EXPO_PUBLIC_NAME}
      />
      <SettingsItem
        text="settings.version"
        value={Env.EXPO_PUBLIC_VERSION}
        isLast
      />
    </SettingsContainer>
  );
}

type IconColorProps = { iconColor: string };

export function SettingsSupportGroup({ iconColor }: IconColorProps) {
  return (
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
        isLast
      />
    </SettingsContainer>
  );
}

export function SettingsLinksGroup({ iconColor }: IconColorProps) {
  return (
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
        isLast
      />
    </SettingsContainer>
  );
}

type LogoutProps = { signOut: () => void };

export function SettingsLogoutGroup({ signOut }: LogoutProps) {
  return (
    <View className="mt-6">
      <SettingsContainer>
        <SettingsItem
          text="settings.logout"
          onPress={signOut}
          variant="danger"
          isLast
        />
      </SettingsContainer>
    </View>
  );
}
