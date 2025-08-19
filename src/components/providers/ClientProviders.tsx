// components/providers/ClientProviders.tsx
'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import ApolloClientProvider from '@/components/providers/apollo-provider-client';

// Toaster (Sonner) caricato dopo l'hydration
const Sonner = dynamic(
  () => import('@/components/ui/sonner').then((m) => m.Toaster),
  { ssr: false }
);

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ApolloClientProvider>
        <TooltipProvider>
          {children}
          <Sonner />
        </TooltipProvider>
      </ApolloClientProvider>
    </ThemeProvider>
  );
}
