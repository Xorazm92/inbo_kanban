import React from 'react';
import { ClerkProvider, useAuth, useSignIn, useSignUp, useUser } from '@clerk/clerk-react';

interface ClerkContextProviderProps {
  publishableKey: string;
  tokenCache?: any;
  children: React.ReactNode;
}

export const ClerkProviderComponent = ({ publishableKey, tokenCache, children }: ClerkContextProviderProps) => {
  return (
    <ClerkProvider publishableKey={publishableKey}>
      {children}
    </ClerkProvider>
  );
};

export const useOAuth = ({ strategy }: { strategy: any }) => {
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, isLoaded: signUpLoaded } = useSignUp();

  const startOAuthFlow = async ({ redirectUrl }: { redirectUrl?: string } = {}): Promise<any> => {
    if (!signInLoaded || !signUpLoaded) return { createdSessionId: null };

    try {
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: redirectUrl || window.location.origin + '/oauth-native-callback',
        redirectUrlComplete: window.location.origin + '/',
      });
    } catch (err) {
      console.error('Web OAuth error', err);
    }
    
    return { createdSessionId: null, setActive: null };
  };

  return { startOAuthFlow };
};

export { useAuth, useSignIn, useSignUp, useUser };
