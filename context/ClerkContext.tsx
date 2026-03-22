import React from 'react';
import { ClerkProvider, useAuth, useSignIn, useSignUp, useUser, useOAuth } from '@clerk/clerk-expo';

interface ClerkContextProviderProps {
  publishableKey: string;
  tokenCache?: any;
  children: React.ReactNode;
}

export const ClerkProviderComponent = ({ publishableKey, tokenCache, children }: ClerkContextProviderProps) => {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      {children}
    </ClerkProvider>
  );
};

export { useAuth, useSignIn, useSignUp, useUser, useOAuth };
