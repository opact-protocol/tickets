import { useApplication } from "@/store";
import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useWalletSelector } from "@/utils/context/wallet";
import { XMarkIcon } from "@heroicons/react/24/solid";

export const AboutUsModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [userAddress, setUserAddress] = useState("");
  const { selector } = useWalletSelector();

  const { sendWhitelist } = useApplication();

  const apply = () => {
    if (!userAddress) {
      return;
    }

    sendWhitelist(selector, userAddress);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[100000]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all space-y-4 relative">
                <button
                  onClick={() => onClose()}
                  className="absolute right-[24px] top-[24px] hover:opacity-[0.7]"
                >
                  <XMarkIcon className="text-[#121315] w-[24px]" />
                </button>

                <Dialog.Title
                  as="span"
                  className="text-[#121315] text-[18px] font-[500]"
                >
                  Hideyour.cash
                </Dialog.Title>

                <div className="mt-2 text-[16px] text-[#121315] space-y-[12px]">
                  <p>Welcome to hideyour.cash MVP!</p>

                  <p>
                    This is a privacy transactions platform currently deployed
                    on NEAR testnet.
                  </p>

                  <p>
                    To try it, you'll need to: connect your wallet, add yourself
                    to the allowlist and then you'll be able to deposit and
                    withdraw NEAR tokens from your NEAR testnet wallet.
                  </p>

                  <p>
                    Please, watch the tutorial to understand how the platform
                    works and to properly test it.
                  </p>

                  <p>
                    After the test, we'll be pleased to get your feedback.
                    You'll find a button on the page to take you to the form.
                  </p>

                  <p>
                    Furthermore, thank you very much for being part of this with
                    us since the beginning!
                  </p>

                  <iframe
                    id="ytplayer"
                    width="100%"
                    height="450px"
                    loading="lazy"
                    frameBorder="0"
                    src="https://www.youtube.com/embed/PLf6f-5FHUCV4AnrxwU_Ylyhax0ID-TOt2?enablejsapi=1&fs=0&rel=0&playlist=A5GY1eJvsqE"
                  />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
