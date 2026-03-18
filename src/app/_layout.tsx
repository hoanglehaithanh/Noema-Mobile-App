import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import { ThemeProvider } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import { StyleSheet } from 'react-native';
import FlashMessage from 'react-native-flash-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { useThemeConfig } from '@/components/ui/use-theme-config';
import { completeOAuthSessionFromUrl } from '@/features/auth/oauth';
import { hydrateAuth, useAuthStore as useAuth } from '@/features/auth/use-auth-store';

import { APIProvider } from '@/lib/api';
import { loadSelectedTheme } from '@/lib/hooks/use-selected-theme';
// Import  global CSS file
import '../global.css';

export { ErrorBoundary } from 'expo-router';

// eslint-disable-next-line react-refresh/only-export-components
export const unstable_settings = {
  initialRouteName: '(app)',
};

hydrateAuth();
loadSelectedTheme();
SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  duration: 500,
  fade: true,
});

export default function RootLayout() {
  const status = useAuth.use.status();

  React.useEffect(() => {
    const handleAuthUrl = async (url: string) => {
      try {
        await completeOAuthSessionFromUrl(url);
      }
      catch (error) {
        console.error(error);
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url)
        void handleAuthUrl(url);
    }).catch(() => {});

    const onUrlChange = ({ url }: { url: string }) => {
      void handleAuthUrl(url);
    };

    const subscription = Linking.addEventListener('url', onUrlChange);

    return () => {
      subscription.remove();
    };
  }, []);

  React.useEffect(() => {
    if (status === 'idle')
      return;

    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 250);

    return () => clearTimeout(timer);
  }, [status]);

  return (
    <Providers>
      <Stack>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen
          name="capture"
          options={{
            presentation: 'modal',
            title: 'Quick Capture',
          }}
        />
        <Stack.Screen
          name="task/[id]"
          options={{ title: 'Task' }}
        />
        <Stack.Screen
          name="session/[id]"
          options={{ title: 'Session' }}
        />
        <Stack.Screen
          name="settings"
          options={{
            title: 'Settings',
            presentation: 'modal',
          }}
        />
      </Stack>
    </Providers>
  );
}

function Providers({ children }: { children: React.ReactNode }) {
  const theme = useThemeConfig();
  return (
    <GestureHandlerRootView
      style={styles.container}
      // eslint-disable-next-line better-tailwindcss/no-unknown-classes
      className={theme.dark ? `dark` : undefined}
    >
      <KeyboardProvider>
        <ThemeProvider value={theme}>
          <APIProvider>
            <BottomSheetModalProvider>
              {children}
              <FlashMessage position="top" />
            </BottomSheetModalProvider>
          </APIProvider>
        </ThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
