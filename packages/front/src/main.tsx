import "./index.css";
import React, { Suspense } from "react";
import { App } from "@/components";
import ReactDOM from "react-dom/client";
import { ToastContainer } from "react-toastify";
import { WalletSelectorContextProvider } from "@/utils/context/wallet";
import { WalletSelectorModal } from "@/components/modals/wallet";
import { ApolloProvider } from "@apollo/client";
import Buffer from "node:buffer";
import { client } from "./services/graphqlClient";
import "react-toastify/dist/ReactToastify.css";

// TODO: Find a better way to handle this buffer error
window.Buffer = window.Buffer || Buffer;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <WalletSelectorContextProvider>
        <Suspense fallback={<p>Loading...</p>}>
          <App />
        </Suspense>
        <ToastContainer
          className="toast-position"
          position="bottom-right"
          toastClassName={() =>
            "relative flex items-center bg-white w-[450px] p-6 rounded-[20px]"
          }
          bodyClassName={() =>
            "text-sm font-black font-md block w-full flex items-center"
          }
          limit={1}
          pauseOnHover={false}
          hideProgressBar={true}
          pauseOnFocusLoss={false}
        />
        <WalletSelectorModal />
      </WalletSelectorContextProvider>
    </ApolloProvider>
  </React.StrictMode>
);
