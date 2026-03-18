import Env from 'env';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CALENDAR_SCOPE = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/calendar.readonly',
].join(' ');

function getParamFromUrl(url: string, key: string) {
  const { queryParams } = Linking.parse(url);
  const value = queryParams?.[key];

  if (typeof value === 'string')
    return value;

  if (Array.isArray(value))
    return value[0] ?? null;

  return null;
}

function getHashParamFromUrl(url: string, key: string) {
  const hashIndex = url.indexOf('#');
  if (hashIndex === -1)
    return null;

  const hash = url.slice(hashIndex + 1);
  const params = new URLSearchParams(hash);
  return params.get(key);
}

export function getOAuthRedirectUrl() {
  return `${Env.EXPO_PUBLIC_SCHEME}://auth/callback`;
}

export async function completeOAuthSessionFromUrl(url: string) {
  const code = getParamFromUrl(url, 'code');
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error)
      throw error;
    return true;
  }

  const accessToken = getHashParamFromUrl(url, 'access_token');
  const refreshToken = getHashParamFromUrl(url, 'refresh_token');

  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error)
      throw error;
    return true;
  }

  return false;
}

export async function signInWithGoogleOAuth() {
  const redirectTo = getOAuthRedirectUrl();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
      scopes: GOOGLE_CALENDAR_SCOPE,
    },
  });

  if (error)
    throw error;

  if (!data?.url)
    throw new Error('Failed to create Google OAuth URL');

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type !== 'success' || !result.url) {
    const reason = result.type === 'cancel'
      ? 'Google sign-in was canceled before callback.'
      : 'Google sign-in was dismissed before callback.';
    throw new Error(reason);
  }

  return completeOAuthSessionFromUrl(result.url);
}

export async function connectGoogleCalendarOAuth() {
  const redirectTo = getOAuthRedirectUrl();
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError)
    throw sessionError;

  // If the user is already signed in (email/OTP etc), link Google as an identity.
  const linkFn = (supabase.auth as any).linkIdentity as undefined | ((args: any) => Promise<any>);
  if (session && typeof linkFn === 'function') {
    const { data, error } = await linkFn({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true,
        scopes: GOOGLE_CALENDAR_SCOPE,
      },
    });
    if (error)
      throw error;
    if (!data?.url)
      throw new Error('Failed to create Google OAuth URL');

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type !== 'success' || !result.url) {
      const reason = result.type === 'cancel'
        ? 'Google connection was canceled before callback.'
        : 'Google connection was dismissed before callback.';
      throw new Error(reason);
    }
    return completeOAuthSessionFromUrl(result.url);
  }

  // Fallback: sign in with Google (will replace session).
  return signInWithGoogleOAuth();
}
