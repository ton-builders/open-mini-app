"use client";

import { THEME, TonConnectUIProvider } from "@tonconnect/ui-react";
import React from "react";

export interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <TonConnectUIProvider
      manifestUrl="https://trc404web.pages.dev/tonconnect-manifest.json"
      uiPreferences={{
        theme: THEME.DARK,
      }}
      actionsConfiguration={{
        twaReturnUrl: "https://t.me/trc404bot/app",
      }}
    >
      {children}
    </TonConnectUIProvider>
  );
}
