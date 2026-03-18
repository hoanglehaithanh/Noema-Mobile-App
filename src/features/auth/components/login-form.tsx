import { useForm } from '@tanstack/react-form';

import * as React from 'react';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import * as z from 'zod';

import { Button, Input, Text, View } from '@/components/ui';
import { getFieldError } from '@/components/ui/form-utils';

const schema = z.object({
  email: z
    .string({
      message: 'Email is required',
    })
    .min(1, 'Email is required')
    .email('Invalid email format'),
});

export type FormType = z.infer<typeof schema>;

export type LoginFormProps = {
  onSubmit?: (data: FormType) => void;
  onGoogleSignIn?: () => void;
  isSuccess?: boolean;
  isGoogleLoading?: boolean;
};

export function LoginForm({
  onSubmit = () => {},
  onGoogleSignIn = () => {},
  isSuccess = false,
  isGoogleLoading = false,
}: LoginFormProps) {
  const form = useForm({
    defaultValues: {
      email: '',
    },

    validators: {
      onChange: schema as any,
    },
    onSubmit: async ({ value }) => {
      onSubmit(value);
    },
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior="padding"
      keyboardVerticalOffset={10}
    >
      <View className="flex-1 justify-center p-4">
        <View className="items-center justify-center">
          <Text
            testID="form-title"
            className="pb-2 text-center text-4xl font-bold"
          >
            Noema
          </Text>
          <Text className="mb-8 text-center text-lg text-muted-foreground">
            Your personal cognitive assistant
          </Text>
        </View>

        {isSuccess
          ? (
              <View className="items-center rounded-xl bg-primary-50 p-6 dark:bg-primary-900">
                <Text className="text-center text-lg font-semibold text-primary-700 dark:text-primary-200">
                  Check your email
                </Text>
                <Text className="mt-2 text-center text-muted-foreground">
                  We sent a magic link to your inbox. Tap it to sign in.
                </Text>
              </View>
            )
          : (
              <>
                <form.Field
                  name="email"
                  children={field => (
                    <Input
                      testID="email-input"
                      label="Email"
                      placeholder="you@example.com"
                      autoCapitalize="none"
                      autoComplete="email"
                      keyboardType="email-address"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChangeText={field.handleChange}
                      error={getFieldError(field)}
                    />
                  )}
                />

                <form.Subscribe
                  selector={state => [state.isSubmitting]}
                  children={([isSubmitting]) => (
                    <View className="gap-3">
                      <Button
                        testID="login-button"
                        label="Send magic link"
                        onPress={form.handleSubmit}
                        loading={isSubmitting}
                      />
                      <Button
                        testID="google-login-button"
                        label="Continue with Google"
                        variant="outline"
                        onPress={onGoogleSignIn}
                        loading={isGoogleLoading}
                      />
                    </View>
                  )}
                />
              </>
            )}
      </View>
    </KeyboardAvoidingView>
  );
}
