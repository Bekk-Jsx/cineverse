'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ApolloProvider } from '@apollo/client/react';
import { queryClient } from '@/frontend/config/queryClient';
import { apolloClient } from '@/frontend/config/apolloClient';
import { SessionProvider } from 'next-auth/react';

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ApolloProvider client={apolloClient}>
          {children}
        </ApolloProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
};

export default Providers;