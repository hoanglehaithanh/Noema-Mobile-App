import * as React from 'react';

import {
  Button,
  FocusAwareStatusBar,
  ScrollView,
  Text,
  View,
} from '@/components/ui';
import { Input } from '@/components/ui/input';

type ReviewFormProps = {
  completedSummary: string;
  openLoops: string;
  firstTaskTomorrow: string;
  reflection: string;
  onChangeCompleted: (v: string) => void;
  onChangeOpen: (v: string) => void;
  onChangeTomorrow: (v: string) => void;
  onChangeReflection: (v: string) => void;
  onSubmit: () => void;
  loading?: boolean;
};

export function ReviewForm(props: ReviewFormProps) {
  return (
    <>
      <FocusAwareStatusBar />
      <ScrollView className="flex-1">
        <View className="flex-1 px-4 pt-16 pb-8">
          <Text className="text-2xl font-bold">Shutdown Review</Text>
          <Text className="mt-1 mb-6 text-sm text-muted-foreground">
            Reconcile today&apos;s plan, then carry tomorrow forward cleanly.
          </Text>

          <Input
            label="What was completed?"
            placeholder="List what you finished today..."
            value={props.completedSummary}
            onChangeText={props.onChangeCompleted}
            multiline
            numberOfLines={4}
            testID="review-completed"
          />
          <Input
            label="What remains open?"
            placeholder="Unfinished tasks or loose ends..."
            value={props.openLoops}
            onChangeText={props.onChangeOpen}
            multiline
            numberOfLines={3}
            testID="review-open"
          />
          <Input
            label="First important task for tomorrow"
            placeholder="What will you start with?"
            value={props.firstTaskTomorrow}
            onChangeText={props.onChangeTomorrow}
            testID="review-tomorrow"
          />
          <Input
            label="Reflection (optional)"
            placeholder="How did today go?"
            value={props.reflection}
            onChangeText={props.onChangeReflection}
            multiline
            numberOfLines={3}
            testID="review-reflection"
          />

          <View className="mt-4">
            <Button
              label="Complete Shutdown"
              onPress={props.onSubmit}
              loading={props.loading}
              testID="review-submit"
            />
          </View>
        </View>
      </ScrollView>
    </>
  );
}
