import { useApplication } from "@/store";
import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useWalletSelector } from "@/utils/context/wallet";

export function WhitelistModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
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
      <Dialog as="div" className="relative z-10" onClose={onClose}>
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
              <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all space-y-4">
                <Dialog.Title
                  as="h1"
                  className="text-black text-[18px] font-medium text-center font-[Sora]"
                >
                  Apply for Allowlist
                </Dialog.Title>

                <div className="mt-2 text-[16px] text-black space-y-[12px]">
                  <p className="text-center">
                    Apply to our allowlist to receive permission to make
                    anonymous transfers at Hideyour.cash.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-black text-[1.1rem] font-medium">
                      Your Address
                    </span>
                  </div>

                  <div>
                    <input
                      className="
                        mt-2
                        p-[8px]
                        h-[43px]
                        bg-[#f7f8fa]
                        rounded-full
                        text-black
                        opacity-[.8]
                        w-full
                        px-[24px]
                        flex items-center justify-between
                      "
                      value={userAddress}
                      onInput={(ev) =>
                        setUserAddress((ev.target as HTMLInputElement).value)
                      }
                      placeholder="near-exemple.testnet"
                    />
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => apply()}
                    className="bg-soft-blue-from-deep-blue mt-[24px] p-[12px] rounded-full w-full font-[400] hover:opacity-[.9] disabled:opacity-[.6] disabled:cursor-not-allowed"
                  >
                    Apply now
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
