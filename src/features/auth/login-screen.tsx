import type { LoginFormProps } from './components/login-form';

import { Redirect } from 'expo-router';
import * as React from 'react';
import { FocusAwareStatusBar } from '@/components/ui';
import { showErrorMessage } from '@/components/ui/utils';
import { signInWithGoogleOAuth } from '@/features/auth/oauth';
import { useAuthStore as useAuth } from '@/features/auth/use-auth-store';
import { supabase } from '@/lib/supabase';
import { LoginForm } from './components/login-form';

export function LoginScreen() {
  const status = useAuth.use.status();
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);

  const onSubmit: LoginFormProps['onSubmit'] = async (data) => {
    const { error } = await supabase.auth.signInWithOtp({
      email: data.email,
    });
    if (error) {
      showErrorMessage(error.message);
      return;
    }
    setIsSuccess(true);
  };

  const onGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogleOAuth();
    }
    catch (error) {
      const message = error instanceof Error ? error.message : 'Google sign-in failed';
      showErrorMessage(message);
    }
    finally {
      setIsGoogleLoading(false);
    }
  };

  if (status === 'signIn')
    return <Redirect href="/(app)" />;

  return (
    <>
      <FocusAwareStatusBar />
      <LoginForm
        onSubmit={onSubmit}
        onGoogleSignIn={onGoogleSignIn}
        isSuccess={isSuccess}
        isGoogleLoading={isGoogleLoading}
      />
    </>
  );
}
