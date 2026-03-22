import type { TxKeyPath } from '@/lib/i18n';

import * as React from 'react';
import { Text, View } from '@/components/ui';

type Props = {
  children: React.ReactNode;
  title?: TxKeyPath;
};

export function SettingsContainer({ children, title }: Props) {
  return (
    <View className="mb-2">
      {title && (
        <Text
          className="mb-3 ml-1 text-xs font-semibold tracking-widest text-muted-foreground uppercase"
          tx={title}
        />
      )}
      <View className="overflow-hidden rounded-2xl border border-neutral-100 bg-card shadow-sm dark:border-neutral-800 dark:shadow-none">
        {children}
      </View>
    </View>
  );
}
