import type { ChatMessage } from './gemini';
import * as React from 'react';
import { FlatList } from 'react-native';

import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import {
  FocusAwareStatusBar,
  Pressable,
  Text,
  View,
} from '@/components/ui';
import { Input } from '@/components/ui/input';
import { getGeminiKey } from '@/features/settings/use-gemini-key';
import { MessageBubble } from './components/message-bubble';
import { callGemini } from './gemini';

export function ChatScreen() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const flatListRef = React.useRef<FlatList>(null);
  const geminiKey = getGeminiKey();

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading)
      return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    if (!geminiKey) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Please set your Gemini API key in Settings to use the chat.' }]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await callGemini(geminiKey, messages, text);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    }
    catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }]);
    }
    finally {
      setIsLoading(false);
    }
  };

  const renderItem = React.useCallback(
    ({ item }: { item: ChatMessage }) => (
      <MessageBubble role={item.role} content={item.content} />
    ),
    [],
  );

  return (
    <>
      <FocusAwareStatusBar />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={90}>
        <View className="flex-1 bg-background pt-16">
          <View className="px-4">
            <Text className="text-2xl font-bold">Planning Chat</Text>
            <Text className="mb-4 text-sm text-muted-foreground">
              Get help planning and reflecting on your work.
            </Text>
          </View>

          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={(_item, i) => String(i)}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}
            className="flex-1"
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />

          {isLoading && (
            <View className="px-4 py-2">
              <Text className="text-sm text-muted-foreground">Thinking...</Text>
            </View>
          )}

          <View className="flex-row items-end gap-2 border-t border-neutral-200 px-4 py-3 dark:border-neutral-700">
            <View className="flex-1">
              <Input
                placeholder="Ask Noema..."
                value={input}
                onChangeText={setInput}
                multiline
                numberOfLines={1}
                onSubmitEditing={sendMessage}
                testID="chat-input"
              />
            </View>
            <Pressable
              onPress={sendMessage}
              disabled={!input.trim() || isLoading}
              className="mb-2 size-10 items-center justify-center rounded-full bg-primary-600 disabled:opacity-50"
            >
              <Text className="font-bold text-white">{'\u2191'}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}
