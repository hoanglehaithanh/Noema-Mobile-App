import type { ShutdownReview } from '@/types';

import * as React from 'react';
import { FocusAwareStatusBar, ScrollView, Text, View } from '@/components/ui';

type Props = {
  review: ShutdownReview;
};

export function ReviewComplete({ review }: Props) {
  return (
    <>
      <FocusAwareStatusBar />
      <ScrollView className="flex-1">
        <View className="flex-1 items-center justify-center px-4 pt-16">
          <Text className="text-2xl font-bold">Day Closed</Text>
          <Text className="mt-2 text-center text-muted-foreground">
            Your shutdown review for today has been saved. Rest well.
          </Text>

          {review.first_task_tomorrow && (
            <View className="mt-6 w-full rounded-xl bg-primary-50 p-4 dark:bg-primary-900">
              <Text className="text-sm font-semibold text-muted-foreground">
                First thing tomorrow
              </Text>
              <Text className="mt-1 text-base font-medium">
                {review.first_task_tomorrow}
              </Text>
            </View>
          )}

          {review.reflection && (
            <View className="mt-4 w-full rounded-xl bg-neutral-50 p-4 dark:bg-neutral-800">
              <Text className="text-sm font-semibold text-muted-foreground">
                Reflection
              </Text>
              <Text className="mt-1 text-base">
                {review.reflection}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}
