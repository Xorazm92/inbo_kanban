import React from 'react';
import { ClerkProvider, useAuth, useOAuth, useSignIn, useSignUp, useUser } from '@clerk/clerk-expo';

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

export { useAuth, useOAuth, useSignIn, useSignUp, useUser };
