import "./index.css";
import React from "react";
import { Buffer } from "buffer";
import { App } from "@/components";
import ReactDOM from "react-dom/client";
import { WalletSelectorContextProvider } from "@/utils/context/wallet";
import { WalletSelectorModal } from "@/components/modals/wallet";

// TODO: Find a better way to handle this buffer error
window.Buffer = window.Buffer || Buffer;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WalletSelectorContextProvider>
      <App />

      <WalletSelectorModal />
    </WalletSelectorContextProvider>
  </React.StrictMode>
);
