import * as React from 'react';

import { Text, View } from '@/components/ui';

type MessageBubbleProps = {
  role: 'user' | 'assistant';
  content: string;
};

export const MessageBubble = React.memo(({ role, content }: MessageBubbleProps) => (
  <View
    className={`mb-3 max-w-[85%] rounded-2xl px-4 py-3 ${
      role === 'user'
        ? 'self-end bg-primary-600'
        : 'self-start bg-neutral-100 dark:bg-neutral-800'
    }`}
  >
    <Text className={role === 'user' ? 'text-white' : 'text-foreground'}>
      {content}
    </Text>
  </View>
));
