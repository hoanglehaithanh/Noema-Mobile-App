import type { User } from '@supabase/supabase-js';

function str(v: unknown): string {
  if (v === null || v === undefined)
    return '';
  if (typeof v === 'string')
    return v;
  if (typeof v === 'boolean')
    return v ? 'true' : 'false';
  if (typeof v === 'number')
    return String(v);
  return '';
}

export function getGoogleIdentity(user: User | null | undefined) {
  return user?.identities?.find(i => i.provider === 'google') ?? null;
}

/** Full display name from linked Google identity or user_metadata (OIDC claims). */
export function getGoogleFullName(user: User | null | undefined): string {
  const google = getGoogleIdentity(user);
  const idData = (google?.identity_data ?? null) as Record<string, unknown> | null;
  const meta = (user?.user_metadata ?? {}) as Record<string, unknown>;
  const name
    = str(idData?.full_name) || str(meta.full_name) || str(meta.name);
  return name.trim();
}

/** Profile image URL from Google when available. */
export function getGoogleAvatarUrl(user: User | null | undefined): string {
  const google = getGoogleIdentity(user);
  const idData = (google?.identity_data ?? null) as Record<string, unknown> | null;
  const meta = (user?.user_metadata ?? {}) as Record<string, unknown>;
  const url
    = str(idData?.avatar_url) || str(meta.avatar_url) || str(meta.picture);
  return url.trim();
}
