import "./index.css";
import React from "react";
import { App } from "@/components";
import ReactDOM from "react-dom/client";
import { ToastContainer } from "react-toastify";
import { WalletSelectorModal } from "@/components/modals/wallet";
import Buffer from "node:buffer";
import "react-toastify/dist/ReactToastify.css";
import { Loader } from "@/components/loader";
// import * as Sentry from "@sentry/react";
// import { BrowserTracing } from "@sentry/tracing";
// import { useEnv } from "@/hooks/useEnv";

// const TRACE_SAMPLE_RATE = useEnv("VITE_TRACES_SAMPLE_RATE");
// const SENTRY_DSN = useEnv("VITE_SENTRY_DSN");

// Sentry.init({
//   dsn: SENTRY_DSN,
//   integrations: [new BrowserTracing()],

//   // Set tracesSampleRate to 1.0 to capture 100%
//   // of transactions for performance monitoring.
//   tracesSampleRate: TRACE_SAMPLE_RATE,
// });

// TODO: Find a better way to handle this buffer error
/* eslint-disable */
window.Buffer = window.Buffer || Buffer;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.Fragment>
    <App />

    <ToastContainer
      className="toast-position"
      position="bottom-right"
      toastClassName={() =>
        "relative flex  bg-[#1C2023] w-[420px] rounded-[8px]  px-[16px] relative"
      }
      limit={1}
      pauseOnHover={false}
      hideProgressBar={true}
      pauseOnFocusLoss={false}
    />
    <WalletSelectorModal />
  </React.Fragment>
);
