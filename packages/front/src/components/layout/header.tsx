import { Container } from "@/components";
import { useWalletSelector } from "@/utils/context/wallet";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { WhitelistModal } from "@/components/modals";
import { useAction } from "@/hooks/useAction";
import Toast from "../shared/toast";

const transactionHashes = new URLSearchParams(window.location.search).get(
  "transactionHashes"
);

export function Header() {
  const [allowList, setAllowList] = useState(() => {
    const data = localStorage.getItem("hyc-allowlist");
    if (data) {
      return Boolean(data);
    }

    return null;
  });

  const { accountId, toggleModal, signOut } = useWalletSelector();

  const [showModal, setShowModal] = useState(false);

  const { action } = useAction(transactionHashes!, accountId!);

  return (
    <>
      <header className="bg-white/80">
        <WhitelistModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />

        <nav>
          <Container className="relative z-50 flex justify-between py-4">
            <div className="relative z-10 flex items-center gap-16">
              <a href="/" aria-label="Home">
                <img
                  className="h-10 w-auto"
                  src="./assets/logo-horizontal.png"
                />
              </a>
            </div>

            <div className="flex items-center gap-6">
              <button
                onClick={() => setShowModal(true)}
                className={`${
                  action &&
                  action.methodName === "whitelist" &&
                  action.status === "success"
                    ? "bg-green-light"
                    : action?.status === "error"
                    ? "bg-warning-3"
                    : allowList
                    ? "bg-green-light"
                    : "bg-soft-blue-normal"
                } flex items-center justify-center space-x-[8px] text-black px-[24px] py-[10px] rounded-full w-full font-normal ${
                  allowList ? "hover:bg-green-medium" : "hover:bg-hover-button"
                } justify-bettween hover:transition-all`}
              >
                {action &&
                action.methodName === "whitelist" &&
                action.status === "success" ? (
                  <img src="/copied-icon.svg" alt="Check icon" />
                ) : action?.status === "error" ? (
                  <img src="/warning-circle-icon.svg" alt="Warning icon" />
                ) : allowList ? (
                  <img src="/copied-icon.svg" alt="Check icon" />
                ) : (
                  <PaperAirplaneIcon className="w-[18px] text-soft-blue" />
                )}
                <span
                  className={`whitespace-nowrap font-bold text-base ${
                    action &&
                    action.methodName === "whitelist" &&
                    action.status === "success"
                      ? "text-success"
                      : action?.status === "error"
                      ? "text-warning"
                      : "text-soft-blue"
                  } ${allowList && "text-success"}`}
                >
                  Allowlist
                </span>
              </button>

              {!!!accountId ? (
                <button
                  onClick={() => toggleModal()}
                  className="flex items-center justify-center space-x-[4px] bg-soft-blue px-[24px] py-[10px] rounded-full w-full font-[400] hover:bg-soft-blue-light justify-bettween hover:transition-all"
                >
                  <img src="/wallet-icon.svg" alt="Wallet icon" />
                  <span className="text-white whitespace-nowrap">
                    Connect Wallet
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => signOut()}
                  className="flex items-center space-x-[8px] bg-soft-blue px-[24px] py-[12px] rounded-full w-full font-[400] hover:opacity-[.9]"
                >
                  <span className="text-white truncate">{accountId}</span>

                  <img src="/power-icon.svg" alt="Power icon" />
                </button>
              )}
            </div>
          </Container>
        </nav>
      </header>
      <Toast
        icon={
          !action && transactionHashes
            ? "processing"
            : action?.status === "success" && action.methodName === "whitelist"
            ? "/check-circle-icon.svg"
            : action?.status === "error" && action.methodName === "whitelist"
            ? "/error-circle-icon.svg"
            : ""
        }
        message={
          !action && transactionHashes
            ? "This process could take a few moments"
            : action?.status === "success" && action.methodName === "whitelist"
            ? "You can start making transactions with safety"
            : action?.status === "error" && action.methodName === "whitelist"
            ? "Something went wrong with your address"
            : ""
        }
        title={
          !action && transactionHashes
            ? "Verifying your address"
            : action?.status === "success" && action.methodName === "whitelist"
            ? "Address verified"
            : action?.status === "error" && action.methodName === "whitelist"
            ? "Address denied."
            : ""
        }
        visible={
          !action && transactionHashes
            ? true
            : action?.status === "success" && action.methodName === "whitelist"
            ? true
            : action?.status === "error" && action.methodName === "whitelist"
            ? true
            : false
        }
      />
    </>
  );
}
