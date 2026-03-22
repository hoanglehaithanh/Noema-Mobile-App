import { storage } from '@/lib/storage';

const GOOGLE_PROVIDER_TOKEN_KEY = 'google_provider_token';
const GOOGLE_PROVIDER_REFRESH_TOKEN_KEY = 'google_provider_refresh_token';
const GOOGLE_PROVIDER_TOKEN_USER_ID_KEY = 'google_provider_token_user_id';

type PersistParams = {
  userId: string;
  providerToken?: string | null;
  providerRefreshToken?: string | null;
};

export function persistGoogleProviderTokens({
  userId,
  providerToken,
  providerRefreshToken,
}: PersistParams) {
  if (!userId)
    return;

  storage.set(GOOGLE_PROVIDER_TOKEN_USER_ID_KEY, userId);
  if (providerToken)
    storage.set(GOOGLE_PROVIDER_TOKEN_KEY, providerToken);
  if (providerRefreshToken)
    storage.set(GOOGLE_PROVIDER_REFRESH_TOKEN_KEY, providerRefreshToken);
}

export function readGoogleProviderTokenForUser(userId: string): string | null {
  if (!userId)
    return null;

  const storedUserId = storage.getString(GOOGLE_PROVIDER_TOKEN_USER_ID_KEY);
  if (!storedUserId || storedUserId !== userId)
    return null;

  return storage.getString(GOOGLE_PROVIDER_TOKEN_KEY) ?? null;
}

export function clearGoogleProviderTokens() {
  storage.remove(GOOGLE_PROVIDER_TOKEN_KEY);
  storage.remove(GOOGLE_PROVIDER_REFRESH_TOKEN_KEY);
  storage.remove(GOOGLE_PROVIDER_TOKEN_USER_ID_KEY);
}
