import { useWallet } from "@/store";
import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Button } from "@/components/button";
import { shortenAddress } from "hideyourcash-sdk";

export function WhitelistModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { allowlist, accountId, toggleModal, sendWhitelist } = useWallet();

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
              <Dialog.Panel className="w-full max-w-[423px] transform overflow-hidden rounded-[8px] bg-form-gradient p-[24px] text-left border-[1px] border-[#606466] align-middle transition-all">
                <Dialog.Title
                  as="h1"
                  className="text-[18px] font-title font-[500] mb-[16px]"
                >
                  Apply for Allowlist
                </Dialog.Title>

                <div className="mb-[32px] ">
                  <p
                    className="
                      text-[15px]
                      font-[500]
                      text-[#BDBDBD]
                    "
                  >
                    Apply to our allowlist to receive permission to make
                    anonymous transfers at Opact Tickets.
                  </p>
                </div>

                {!accountId && (
                  <div>
                    <Button
                      disabled={false}
                      isLoading={false}
                      onClick={() => toggleModal()}
                      text="Connect wallet"
                    />
                  </div>
                )}

                {
                  accountId &&
                  <div>
                    <Button
                      disabled={!!allowlist && !!accountId}
                      isLoading={false}
                      onClick={() => sendWhitelist()}
                      text={allowlist && shortenAddress(accountId) ? "You are already on the allowlist" : "Apply now"}
                    />
                  </div>
                }
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
