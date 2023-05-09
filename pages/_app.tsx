// Temporarily removing until we pull components from the SDK.
// import "@xmtp/react-sdk/style.css";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import dynamic from "next/dynamic";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, Connector, createClient, WagmiConfig } from "wagmi";
import { mainnet } from "wagmi/chains";
import { infuraProvider } from "wagmi/providers/infura";
import { publicProvider } from "wagmi/providers/public";
import React, { useEffect, useState } from "react";
import { isAppEnvDemo } from "../helpers";
import "../i18n";
import { XMTPProvider } from "@xmtp/react-sdk";
import { getMockConnector } from "../helpers/mockConnector";

const AppWithoutSSR = dynamic(() => import("../components/App"), {
  ssr: false,
});

const { chains, provider, webSocketProvider } = configureChains(
  [mainnet],
  [
    infuraProvider({ apiKey: process.env.NEXT_PUBLIC_INFURA_ID ?? "" }),
    publicProvider(),
  ],
);

const { connectors } = getDefaultWallets({
  appName: "XMTP Inbox Web",
  chains,
});

function AppWrapper({ Component, pageProps }: AppProps) {
  // setting the type to any because the return
  // type of createClient is not being exported
  const [client, setClient] = useState<any>(null);
  useEffect(() => {
    if (isAppEnvDemo()) {
      const wagmiDemoClient = createClient({
        autoConnect: true,
        connectors: [(getMockConnector() as Connector) ?? {}],
        provider,
        webSocketProvider,
      });
      setClient(wagmiDemoClient);
    } else {
      const wagmiClient = createClient({
        autoConnect: true,
        connectors,
        provider,
        webSocketProvider,
      });
      setClient(wagmiClient);
    }
  }, []);

  return (
    client && (
      <WagmiConfig client={client}>
        <RainbowKitProvider chains={chains}>
          <React.StrictMode>
            <XMTPProvider>
              <AppWithoutSSR>
                <Component {...pageProps} />
              </AppWithoutSSR>
            </XMTPProvider>
          </React.StrictMode>
        </RainbowKitProvider>
      </WagmiConfig>
    )
  );
}

export default AppWrapper;
