import type { CaptureKind } from '@/types';
import { useRouter } from 'expo-router';
import * as React from 'react';

import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import {
  Button,
  FocusAwareStatusBar,
  Pressable,
  Text,
  View,
} from '@/components/ui';
import { Input } from '@/components/ui/input';
import { showErrorMessage } from '@/components/ui/utils';
import { useCreateCapture } from './api';

const KINDS: { label: string; value: CaptureKind }[] = [
  { label: 'Task', value: 'task' },
  { label: 'Idea', value: 'idea' },
  { label: 'Reminder', value: 'reminder' },
  { label: 'Note', value: 'note' },
];

type CaptureScreenProps = {
  onCaptured?: () => void;
  embedded?: boolean;
};

export function CaptureScreen({ onCaptured, embedded }: CaptureScreenProps = {}) {
  const router = useRouter();
  const [content, setContent] = React.useState('');
  const [kind, setKind] = React.useState<CaptureKind>('task');
  const { mutate: createCapture, isPending } = useCreateCapture();

  const handleSave = () => {
    if (!content.trim())
      return;
    createCapture(
      { content: content.trim(), kind },
      {
        onSuccess: () => {
          setContent('');
          if (onCaptured) {
            onCaptured();
          }
          else {
            router.back();
          }
        },
        onError: (error: unknown) => {
          const message
            = error instanceof Error
              ? error.message
              : typeof error === 'object' && error !== null && 'message' in error
                ? String((error as { message: unknown }).message)
                : 'Could not save capture';
          showErrorMessage(message);
        },
      },
    );
  };

  const Wrapper = embedded ? View : KeyboardAvoidingView;
  const wrapperProps = embedded
    ? { className: 'flex-1' }
    : { style: { flex: 1 }, behavior: 'padding' as const, keyboardVerticalOffset: 10 };

  return (
    <>
      {!embedded && <FocusAwareStatusBar />}
      <Wrapper {...wrapperProps}>
        <View className="flex-1 bg-background px-4 pt-6">
          {!embedded && (
            <Text className="mb-4 text-2xl font-bold">Quick Capture</Text>
          )}

          <Input
            testID="capture-input"
            placeholder="What's on your mind?"
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={3}
            autoFocus
          />

          <View className="mt-3 flex-row gap-2">
            {KINDS.map(k => (
              <Pressable
                key={k.value}
                onPress={() => setKind(k.value)}
                className={`rounded-full px-4 py-2 ${
                  kind === k.value
                    ? 'bg-primary-600'
                    : 'bg-neutral-100 dark:bg-neutral-800'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    kind === k.value
                      ? 'text-white'
                      : 'text-neutral-600 dark:text-neutral-300'
                  }`}
                >
                  {k.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <View className="mt-6">
            <Button
              testID="capture-save"
              label="Capture"
              onPress={handleSave}
              loading={isPending}
              disabled={!content.trim()}
            />
          </View>
        </View>
      </Wrapper>
    </>
  );
}
