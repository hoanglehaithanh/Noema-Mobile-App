import type { LoginFormProps } from './login-form';

import * as React from 'react';

import { cleanup, screen, setup, waitFor } from '@/lib/test-utils';
import { LoginForm } from './login-form';

afterEach(cleanup);

const onSubmitMock: jest.Mock<LoginFormProps['onSubmit']> = jest.fn();
const onGoogleSignInMock: jest.Mock<LoginFormProps['onGoogleSignIn']> = jest.fn();

describe('loginForm Form ', () => {
  beforeEach(() => {
    onSubmitMock.mockClear();
    onGoogleSignInMock.mockClear();
  });

  it('renders correctly', async () => {
    setup(<LoginForm />);
    expect(await screen.findByTestId('form-title')).toBeOnTheScreen();
    expect(screen.getByTestId('google-login-button')).toBeOnTheScreen();
  });

  it('should display required error when email is empty', async () => {
    const { user } = setup(<LoginForm />);

    const button = screen.getByTestId('login-button');
    expect(screen.queryByText(/Email is required/i)).not.toBeOnTheScreen();
    await user.press(button);
    expect(await screen.findByText(/Email is required/i)).toBeOnTheScreen();
  });

  it('should display matching error when email is invalid', async () => {
    const { user } = setup(<LoginForm />);

    const button = screen.getByTestId('login-button');
    const emailInput = screen.getByTestId('email-input');

    await user.type(emailInput, 'yyyyy');
    emailInput.props.onBlur();
    await user.press(button);

    expect(await screen.findByText(/Invalid Email Format/i)).toBeOnTheScreen();
    expect(screen.queryByText(/Email is required/i)).not.toBeOnTheScreen();
  });

  it('should call LoginForm with correct values when email is valid', async () => {
    const { user } = setup(<LoginForm onSubmit={onSubmitMock} />);

    const button = screen.getByTestId('login-button');
    const emailInput = screen.getByTestId('email-input');

    await user.type(emailInput, 'youssef@gmail.com');
    await user.press(button);
    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledTimes(1);
    });
    expect(onSubmitMock).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'youssef@gmail.com',
      }),
    );
  });

  it('should show success message when isSuccess is true', async () => {
    setup(<LoginForm isSuccess />);
    expect(await screen.findByText(/Check your email/i)).toBeOnTheScreen();
    expect(screen.queryByTestId('login-button')).not.toBeOnTheScreen();
    expect(screen.queryByTestId('google-login-button')).not.toBeOnTheScreen();
  });

  it('should call Google sign-in callback', async () => {
    const { user } = setup(<LoginForm onGoogleSignIn={onGoogleSignInMock} />);
    await user.press(screen.getByTestId('google-login-button'));
    expect(onGoogleSignInMock).toHaveBeenCalledTimes(1);
  });
});
