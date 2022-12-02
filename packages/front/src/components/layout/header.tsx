import { Container } from "@/components";
import { useWalletSelector } from "@/utils/context/wallet";
import {
  ArrowLeftOnRectangleIcon,
  ChevronRightIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import { WhitelistModal } from "@/components/modals";

export function Header() {
  const { accountId, toggleModal, signOut } = useWalletSelector();

  const [showModal, setShowModal] = useState(false);

  return (
    <header className="bg-gray-100">
      <WhitelistModal isOpen={showModal} onClose={() => setShowModal(false)} />

      <nav>
        <Container className="relative z-50 flex justify-between py-8">
          <div className="relative z-10 flex items-center gap-16">
            <a href="/" aria-label="Home">
              <img className="h-10 w-auto" src="./assets/logo-horizontal.png" />
            </a>
          </div>

          <div className="flex items-center space-x-[12px]">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center space-x-[8px] text-[#121315] px-[24px] py-[12px] rounded-full w-full font-[400] hover:bg-gray-200 justify-bettween"
            >
              <span className="whitespace-nowrap">Whitelist</span>

              <PaperAirplaneIcon className="w-[18px]" />
            </button>

            {!!!accountId ? (
              <button
                onClick={() => toggleModal()}
                className="flex items-center space-x-[4px] bg-[#121315] px-[24px] py-[12px] rounded-full w-full font-[400] hover:opacity-[.9] justify-bettween"
              >
                <span className="text-white whitespace-nowrap">
                  Connect Wallet
                </span>

                <ChevronRightIcon className="w-[18px]" />
              </button>
            ) : (
              <button
                onClick={() => signOut()}
                className="flex items-center space-x-[8px] bg-[#121315] px-[24px] py-[12px] rounded-full w-full font-[400] hover:opacity-[.9]"
              >
                <span
                  children={accountId?.split(".").at(0)}
                  className="text-white"
                />

                <ArrowLeftOnRectangleIcon className="w-[18px]" />
              </button>
            )}
          </div>
        </Container>
      </nav>
    </header>
  );
}
