import { Container } from "@/components";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { WhitelistModal } from "@/components/modals";
import { useAllowlist } from "@/hooks/useAllowlist";
import { useWallet } from "@/store/wallet";

export function Header() {
  const { accountId, toggleModal, signOut } = useWallet();
  const [showModal, setShowModal] = useState(false);

  const { allowList } = useAllowlist(accountId!);

  return (
    <>
      <header className="bg-white/80 relative z-50">
        <WhitelistModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />

        <nav>
          <Container className="relative z-50 flex justify-between py-4">
            <div className="relative z-10 flex items-center gap-16">
              <a href="/" aria-label="Home">
                <img className="sm:hidden h-6 w-auto" src="/mini-logo.svg" />
                <img
                  className="hidden h-6 w-auto sm:block"
                  src="./assets/logo-horizontal.png"
                />
              </a>
            </div>

            <div className="flex items-center gap-6">
              <button
                onClick={() => setShowModal(true)}
                className={`${
                  allowList && accountId
                    ? "bg-green-light"
                    : "bg-soft-blue-normal"
                } flex h-[3rem] sm:h-full items-center justify-center space-x-[8px] text-black px-[24px] py-[12px] sm:py-[10px] rounded-full w-full font-normal ${
                  allowList && accountId
                    ? "hover:bg-green-medium"
                    : "hover:bg-hover-button"
                } justify-bettween hover:transition-all`}
              >
                {allowList && accountId ? (
                  <img src="/copied-icon.svg" alt="Check icon" />
                ) : (
                  <PaperAirplaneIcon className="w-[18px] text-soft-blue" />
                )}
                <span
                  className={`hidden sm:block whitespace-nowrap text-soft-blue-medium font-bold text-base ${
                    allowList && accountId && "text-success"
                  }`}
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
                  className="flex items-center space-x-[8px] bg-soft-blue px-[24px] py-[12px] rounded-full w-full max-w-[150px] sm:max-w-full font-[400] hover:opacity-[.9]"
                >
                  <span
                    className="w-[150px] text-white truncate"
                    title={accountId}
                  >
                    {accountId}
                  </span>

                  <img src="/power-icon.svg" alt="Power icon" />
                </button>
              )}
            </div>
          </Container>
        </nav>
      </header>
    </>
  );
}
