import "./index.css";
import React from "react";
import { App } from "@/components";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { WalletSelectorContextProvider } from "@/utils/context/wallet";
import { WalletSelectorModal } from "@/components/modals/wallet";
import { ApolloProvider } from "@apollo/client";
import Buffer from "node:buffer";
import { client } from "./services/graphqlClient";

// TODO: Find a better way to handle this buffer error
window.Buffer = window.Buffer || Buffer;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <WalletSelectorContextProvider>
        <App />
        <Toaster position="bottom-right" reverseOrder={false} />
        <WalletSelectorModal />
      </WalletSelectorContextProvider>
    </ApolloProvider>
  </React.StrictMode>
);
