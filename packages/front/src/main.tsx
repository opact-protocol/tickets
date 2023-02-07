import "./index.css";
import React, { Suspense } from "react";
import { App } from "@/components";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { WalletSelectorContextProvider } from "@/utils/context/wallet";
import { WalletSelectorModal } from "@/components/modals/wallet";
import Buffer from "node:buffer";

// TODO: Find a better way to handle this buffer error
window.Buffer = window.Buffer || Buffer;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WalletSelectorContextProvider>
      <Suspense fallback={<p>Loading...</p>}>
        <App />
      </Suspense>
      <Toaster position="bottom-right" reverseOrder={false} />
      <WalletSelectorModal />
    </WalletSelectorContextProvider>
  </React.StrictMode>
);
