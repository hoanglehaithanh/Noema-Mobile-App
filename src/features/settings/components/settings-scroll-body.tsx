import type { Session } from '@supabase/supabase-js';
import type { Profile } from '@/types';

import * as React from 'react';

import { ScrollView, Text, View } from '@/components/ui';

import {
  SettingsAboutGroup,
  SettingsAccountGroup,
  SettingsAiGroup,
  SettingsGeneralGroup,
  SettingsLinksGroup,
  SettingsLogoutGroup,
  SettingsSupportGroup,
} from './settings-scroll-groups';

type Props = {
  session: Session | null;
  profile: Profile | null | undefined;
  signOut: () => void;
  iconColor: string;
  geminiKey: string | null;
  isCheckingCalendarSync: boolean;
  calendarCanSync: boolean;
  calendarSuggestReconnect: boolean;
  isConnectingCalendar: boolean;
  onConnectCalendar: () => void;
};

export function SettingsScrollBody({
  session,
  profile,
  signOut,
  iconColor,
  geminiKey,
  isCheckingCalendarSync,
  calendarCanSync,
  calendarSuggestReconnect,
  isConnectingCalendar,
  onConnectCalendar,
}: Props) {
  return (
    <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
      <View className="px-4 pt-16 pb-10">
        <Text className="text-4xl font-extrabold tracking-tight text-foreground" tx="settings.title" />
        <Text className="mt-1 text-sm/relaxed text-muted-foreground" tx="settings.subtitle" />

        <View className="mt-8">
          <SettingsAccountGroup session={session} profile={profile} />
          <SettingsGeneralGroup />
          <SettingsAiGroup
            geminiKey={geminiKey}
            isCheckingCalendarSync={isCheckingCalendarSync}
            calendarCanSync={calendarCanSync}
            calendarSuggestReconnect={calendarSuggestReconnect}
            isConnectingCalendar={isConnectingCalendar}
            onConnectCalendar={onConnectCalendar}
          />
          <SettingsAboutGroup />
          <SettingsSupportGroup iconColor={iconColor} />
          <SettingsLinksGroup iconColor={iconColor} />
          <SettingsLogoutGroup signOut={signOut} />
        </View>
      </View>
    </ScrollView>
  );
}
