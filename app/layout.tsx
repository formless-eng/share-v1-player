'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { SmartWalletsProvider } from '@privy-io/react-auth/smart-wallets';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { base } from 'viem/chains';

import { Player } from '@/app/components/Player';
import { AssetContextProvider } from '@/app/contexts/AssetContext';
import { PlayerContextProvider } from '@/app/contexts/PlayerContext';

import './globals.css';

const queryClient = new QueryClient();

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'cm6quez1r00uh6wnjbhkw59ru';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Share - Digital Media Marketplace</title>
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <PrivyProvider
            appId={PRIVY_APP_ID}
            config={{
              appearance: {
                theme: 'light',
                accentColor: '#000000',
              },
              embeddedWallets: {
                ethereum: {
                  createOnLogin: 'users-without-wallets',
                },
              },
              supportedChains: [base],
            }}
          >
            <SmartWalletsProvider>
              <PlayerContextProvider>
                <AssetContextProvider>
                  <Player />
                  {children}
                </AssetContextProvider>
              </PlayerContextProvider>
            </SmartWalletsProvider>
          </PrivyProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
