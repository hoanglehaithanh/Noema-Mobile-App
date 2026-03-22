import type { TxKeyPath } from '@/lib/i18n';

import * as React from 'react';
import { Pressable, Text, View } from '@/components/ui';
import { ArrowRight } from '@/components/ui/icons';

type ItemProps = {
  text: TxKeyPath;
  value?: string;
  onPress?: () => void;
  icon?: React.ReactNode;
  /** Omit bottom divider inside grouped card (last row). */
  isLast?: boolean;
  variant?: 'default' | 'danger';
};

export function SettingsItem({
  text,
  value,
  icon,
  onPress,
  isLast,
  variant = 'default',
}: ItemProps) {
  const isPressable = onPress !== undefined;
  return (
    <Pressable
      onPress={onPress}
      pointerEvents={isPressable ? 'auto' : 'none'}
      className={`flex-row items-center justify-between px-4 py-3.5 active:opacity-90 ${
        isLast ? '' : 'border-b border-neutral-100 dark:border-neutral-800'
      }`}
    >
      <View className="min-w-0 flex-1 flex-row items-center pr-3">
        {icon && <View className="mr-3">{icon}</View>}
        <Text
          className={`text-[15px] font-medium ${
            variant === 'danger' ? 'text-danger-500' : 'text-foreground'
          }`}
          tx={text}
        />
      </View>
      <View className="max-w-[55%] flex-row items-center">
        {value !== undefined && value !== '' && (
          <Text className="text-right text-sm text-muted-foreground" numberOfLines={2}>
            {value}
          </Text>
        )}
        {isPressable && (
          <View className="ml-2 shrink-0">
            <ArrowRight />
          </View>
        )}
      </View>
    </Pressable>
  );
}
