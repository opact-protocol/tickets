import { Container } from "@/components";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { WhitelistModal } from "@/components/modals";
import { useAllowlist } from "@/hooks/useAllowlist";
import { useWallet } from "@/store/wallet";

export function Header() {
  const { selector, accountId, toggleModal, signOut } = useWallet();
  const [showModal, setShowModal] = useState(false);

  const { action } = useAction(transactionHashes!, accountId!);

  if (
    action &&
    action?.methodName === "whitelist" &&
    action.status === "success"
  ) {
    toast.custom((t) => (
      <div>
        <div className="flex items-center gap-3 p-5">
          <img src="/check-circle-icon.svg" alt="Check Icon" />
          <h1 className="text-dark-grafiti-medium font-[Sora] font-bold text-base">
            Address verified
          </h1>
        </div>
        <p className="text-dark-grafiti-medium text-base font-normal">
          The funds has been sent to the address.
        </p>
      </div>
    ));
    setIsOpen(true);
  }

  const { allowList } = useAllowlist(accountId!, selector);

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
                  allowList && accountId
                    ? "bg-green-light"
                    : "bg-soft-blue-normal"
                } flex items-center justify-center space-x-[8px] text-black px-[24px] py-[10px] rounded-full w-full font-normal ${
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
                  className={`whitespace-nowrap text-soft-blue-medium font-bold text-base ${allowList &&
                    accountId &&
                    "text-success"}`}
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
