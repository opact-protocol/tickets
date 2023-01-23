import { Container } from "@/components";
import { useWalletSelector } from "@/utils/context/wallet";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { WhitelistModal } from "@/components/modals";

export function Header() {
  const { accountId, toggleModal, signOut } = useWalletSelector();

  const [showModal, setShowModal] = useState(false);

  return (
    <header className="bg-white/80">
      <WhitelistModal isOpen={showModal} onClose={() => setShowModal(false)} />

      <nav>
        <Container className="relative z-50 flex justify-between py-4">
          <div className="relative z-10 flex items-center gap-16">
            <a href="/" aria-label="Home">
              <img className="h-10 w-auto" src="./assets/logo-horizontal.png" />
            </a>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setShowModal(true)}
              className="bg-[#E8EAFF] flex items-center justify-center space-x-[8px] text-[#121315] px-[24px] py-[10px] rounded-full w-full font-[400] hover:bg-gray-200 justify-bettween"
            >
              <PaperAirplaneIcon className="w-[18px] text-[#606CD2]" />
              <span className="whitespace-nowrap text-[#606CD2]">
                Allowlist
              </span>
            </button>

            {!!!accountId ? (
              <button
                onClick={() => toggleModal()}
                className="flex items-center justify-center space-x-[4px] bg-[#606CD2] px-[24px] py-[10px] rounded-full w-full font-[400] hover:opacity-[.9] justify-bettween"
              >
                <img src="/wallet-icon.svg" alt="Wallet icon" />
                <span className="text-white whitespace-nowrap">
                  Connect Wallet
                </span>
              </button>
            ) : (
              <button
                onClick={() => signOut()}
                className="flex items-center space-x-[8px] bg-[#606CD2] px-[24px] py-[12px] rounded-full w-full font-[400] hover:opacity-[.9]"
              >
                <span className="text-white truncate">{accountId}</span>

                <img src="/power-icon.svg" alt="Power icon" />
              </button>
            )}
          </div>
        </Container>
      </nav>
    </header>
  );
}
