import Env from 'env';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { persistGoogleProviderTokens } from '@/features/auth/google-provider-token';
import { getGoogleIdentity } from '@/features/settings/google-account-details';
import { supabase } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

/** Scopes requested from Google (sign-in and full Calendar access). */
export const GOOGLE_OAUTH_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/calendar',
] as const;

const GOOGLE_CALENDAR_SCOPE = GOOGLE_OAUTH_SCOPES.join(' ');
const GOOGLE_OAUTH_QUERY_PARAMS = {
  access_type: 'offline',
  prompt: 'consent',
  include_granted_scopes: 'true',
} as const;

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
  const callbackError = getParamFromUrl(url, 'error') ?? getHashParamFromUrl(url, 'error');
  if (callbackError) {
    const callbackErrorCode = getParamFromUrl(url, 'error_code') ?? getHashParamFromUrl(url, 'error_code');
    const callbackErrorDescription
      = getParamFromUrl(url, 'error_description') ?? getHashParamFromUrl(url, 'error_description');
    throw new Error(
      `OAuth callback failed (${callbackErrorCode ?? callbackError}): ${callbackErrorDescription ?? 'Unknown error'}`,
    );
  }

  const code = getParamFromUrl(url, 'code');
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error)
      throw error;
    if (data.session?.user?.id) {
      persistGoogleProviderTokens({
        userId: data.session.user.id,
        providerToken: data.session.provider_token,
        providerRefreshToken: data.session.provider_refresh_token,
      });
    }
    return true;
  }

  const accessToken = getHashParamFromUrl(url, 'access_token');
  const refreshToken = getHashParamFromUrl(url, 'refresh_token');
  const providerToken = getHashParamFromUrl(url, 'provider_token');
  const providerRefreshToken = getHashParamFromUrl(url, 'provider_refresh_token');

  if (accessToken && refreshToken) {
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error)
      throw error;
    if (data.session?.user?.id) {
      persistGoogleProviderTokens({
        userId: data.session.user.id,
        providerToken: providerToken ?? data.session.provider_token,
        providerRefreshToken: providerRefreshToken ?? data.session.provider_refresh_token,
      });
    }
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
      queryParams: GOOGLE_OAUTH_QUERY_PARAMS,
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
  // If Google identity already exists, run Google OAuth sign-in again to force consent refresh.
  // linkIdentity in this case returns identity_already_exists and won't issue provider tokens.
  if (session) {
    const hasGoogleIdentity = Boolean(getGoogleIdentity(session.user));
    if (hasGoogleIdentity) {
      return signInWithGoogleOAuth();
    }

    // Call linkIdentity on supabase.auth directly — extracting the method drops `this`,
    // which breaks the internal linkIdentityOAuth call ("is not a function").
    const { data, error } = await supabase.auth.linkIdentity({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true,
        scopes: GOOGLE_CALENDAR_SCOPE,
        queryParams: GOOGLE_OAUTH_QUERY_PARAMS,
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
