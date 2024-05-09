import { Container } from "@/components";
import { useState } from "react";
import { WhitelistModal } from "@/components/modals";
// import { useWallet } from "@/store/wallet";
// import { ButtonPrimary } from "../button-primary";
// import { ButtonSecondary } from "../button-secondary";
import { NeedHelp } from "./needHelp";
// import { Arrow } from "@/components/assets/arrow";
// import { shortenAddress } from "hideyourcash-sdk";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export function Header() {
  // const { accountId, toggleModal, signOut } = useWallet();
  const [showModal, setShowModal] = useState(false);

  return (
    <header className="relative z-50">
      <WhitelistModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />

      <nav
        className="w-full absolute"
      >
        <div
          className="bg-[#060A0F] h-[44px] w-full flex items-center justify-center border-b-[2px] border-[#606466] py-[8px]"
        >
          <div className="flex">
            <ExclamationTriangleIcon className="w-[18px] text-[#919699]" />

            <p className="hidden lg:block text-[#919699] text-[16px] text-center font-[600] ml-[8px]">
              This app will be discontinued by June, 9th. Please, withdraw all your funds before that
            </p>

            <p className="lg:hidden text-bold text-[#919699] text-center ml-[8px]">
            This app will be discontinued by June, 9th.
            </p>
          </div>

        </div>

        <Container
          className="
            px-[16px]
            max-w-full
            sm:px-[32px]
            lg:px-[30px]
            xl:px-[60px]
            py-[12px]
            lg:py-[18px]
            flex
            justify-between
            bg-[rgba(16,_20,_24,_0.88)]
            backdrop-blur-[4px]
            lg:bg-[#060A0F]/[0.42]
            lg:backdrop-blur-[6px]
            lg:mb-[8px]

            flex-col space-y-[12px]
            md:flex-row md:space-y-0
          "
        >
          <div className="relative z-10 flex items-center gap-16">
            <a href="/" aria-label="Home">
              <img
                className="h-[32px] w-auto"
                src="./logo.svg"
              />
            </a>
          </div>

          <div className="flex items-center gap-6">
            {/* <ButtonPrimary
              disabled={false}
              isLoading={false}
              onClick={() => setShowModal(true)}
              text="Allowlist"
            />

            {!!!accountId ? (
              <ButtonSecondary
                withIcon={true}
                disabled={false}
                isLoading={false}
                onClick={() => toggleModal()}
                text="Connect Wallet"
              />
            ) : (
              <ButtonSecondary
                withIcon={false}
                disabled={false}
                isLoading={false}
                onClick={() => signOut()}
                text={shortenAddress(accountId)}
              />
            )} */}

            <div>
              <NeedHelp />
            </div>
          </div>
        </Container>
      </nav>
    </header>
  );
}
