import { useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';

import { useUniwind } from 'uniwind';
import { colors, FocusAwareStatusBar } from '@/components/ui';
import { showErrorMessage } from '@/components/ui/utils';
import { connectGoogleCalendarOAuth } from '@/features/auth/oauth';

import {
  useAuthStore as useAuth,
  verifySessionWithServer,
} from '@/features/auth/use-auth-store';
import { useCalendarSyncEligibility } from '@/features/calendar/api';
import {
  getGoogleFullName,
  getGoogleIdentity,
} from '@/features/settings/google-account-details';
import { useProfile, useUpdateProfile } from './api';
import { SettingsScrollBody } from './components/settings-scroll-body';
import { getGeminiKey } from './use-gemini-key';

export function SettingsScreen() {
  const queryClient = useQueryClient();
  const signOut = useAuth.use.signOut();
  const session = useAuth.use.session();
  const { data: profile } = useProfile();
  const { mutate: updateProfile } = useUpdateProfile();
  const {
    data: calendarEligibility,
    isFetching: isCalendarEligibilityFetching,
    isError: isCalendarEligibilityError,
    refetch: refetchCalendarEligibility,
    isFetched: calendarEligibilityFetched,
  } = useCalendarSyncEligibility();
  const appliedGoogleDisplayNameRef = React.useRef(false);
  const { theme } = useUniwind();
  const iconColor
    = theme === 'dark' ? colors.neutral[400] : colors.neutral[500];

  const geminiKey = getGeminiKey();
  const [isConnectingCalendar, setIsConnectingCalendar] = React.useState(false);

  useFocusEffect(
    React.useCallback(() => {
      void (async () => {
        await verifySessionWithServer();
        await refetchCalendarEligibility();
      })();
    }, [refetchCalendarEligibility]),
  );

  const googleFullName = React.useMemo(
    () => getGoogleFullName(session?.user),
    [session?.user],
  );

  React.useEffect(() => {
    appliedGoogleDisplayNameRef.current = false;
  }, [session?.user?.id]);

  React.useEffect(() => {
    if (!profile || !googleFullName)
      return;
    if (profile.display_name?.trim()) {
      appliedGoogleDisplayNameRef.current = false;
      return;
    }
    if (appliedGoogleDisplayNameRef.current)
      return;
    appliedGoogleDisplayNameRef.current = true;
    updateProfile(
      { display_name: googleFullName },
      {
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
        onError: () => {
          appliedGoogleDisplayNameRef.current = false;
        },
      },
    );
  }, [profile, googleFullName, updateProfile, queryClient]);

  const isCheckingCalendarSync
    = isCalendarEligibilityFetching
      && calendarEligibility === undefined
      && calendarEligibilityFetched;
  const calendarCanSync = calendarEligibility?.canSync ?? false;
  const calendarSuggestReconnect = Boolean(
    (calendarEligibility
      && !calendarEligibility.canSync
      && calendarEligibility.hasGoogleIdentity)
    || (isCalendarEligibilityError && Boolean(getGoogleIdentity(session?.user))),
  );

  const handleConnectCalendar = async () => {
    if (isConnectingCalendar)
      return;
    setIsConnectingCalendar(true);
    try {
      await connectGoogleCalendarOAuth();
      await queryClient.invalidateQueries({ queryKey: ['calendar_sync_eligibility'] });
      await queryClient.invalidateQueries({ queryKey: ['calendar_primary_events'] });
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
      <SettingsScrollBody
        session={session ?? null}
        profile={profile}
        signOut={signOut}
        iconColor={iconColor}
        geminiKey={geminiKey}
        isCheckingCalendarSync={isCheckingCalendarSync}
        calendarCanSync={calendarCanSync}
        calendarSuggestReconnect={calendarSuggestReconnect}
        isConnectingCalendar={isConnectingCalendar}
        onConnectCalendar={handleConnectCalendar}
      />
    </>
  );
}
