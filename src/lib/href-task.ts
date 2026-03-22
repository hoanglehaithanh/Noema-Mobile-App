import type { Href } from 'expo-router';

/**
 * Builds `/task/[id]` with optional `?from=` so the root stack can show the correct
 * iOS back label (the parent tab is the route group `(app)`, not the visible screen).
 */
export function hrefTask(id: string, backTitle?: string): Href {
  const trimmed = backTitle?.trim();
  if (!trimmed)
    return `/task/${id}` as Href;
  return `/task/${id}?from=${encodeURIComponent(trimmed)}` as Href;
}
