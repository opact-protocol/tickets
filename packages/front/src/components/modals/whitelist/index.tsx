import { useApplication } from "@/store";
import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useWalletSelector } from "@/utils/context/wallet";
import { useAllowlist } from "@/hooks/useAllowlist";

export function WhitelistModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { selector, accountId, toggleModal } = useWalletSelector();

  const { sendWhitelist } = useApplication();

  const { allowList } = useAllowlist(accountId!, selector);

  const apply = () => {
    if (!accountId) {
      return;
    }
    sendWhitelist(selector, accountId!);
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
                  {allowList && accountId
                    ? "You are already on the allowlist"
                    : "Apply for Allowlist"}
                </Dialog.Title>

                {!allowList && (
                  <div className="mt-2 text-[16px] text-black space-y-[12px]">
                    <p className="text-center">
                      Apply to our allowlist to receive permission to make
                      anonymous transfers at Hideyour.cash.
                    </p>
                  </div>
                )}

                {accountId && (
                  <div className="flex items-center justify-center">
                    <span className="text-black text-[1.1rem] font-medium">
                      Your Address
                    </span>
                  </div>
                )}

                <div>
                  {accountId && allowList ? (
                    <div>
                      <h2 className="text-dark-grafiti font-bold font-[Sora] mt-4 text-center">
                        {accountId}
                      </h2>
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-dark-grafiti font-bold font-[Sora] mt-4 text-center">
                        {accountId}
                      </h2>
                    </div>
                  )}
                </div>

                {!accountId && (
                  <div>
                    <button
                      onClick={() => toggleModal()}
                      className="bg-soft-blue-from-deep-blue mt-[24px] p-[12px] rounded-full w-full font-[400] hover:opacity-[.9] disabled:opacity-[.6] disabled:cursor-not-allowed"
                    >
                      Connect wallet
                    </button>
                  </div>
                )}

                {!allowList && accountId && (
                  <div>
                    <button
                      onClick={() => apply()}
                      className="bg-soft-blue-from-deep-blue mt-[24px] p-[12px] rounded-full w-full font-[400] hover:opacity-[.9] disabled:opacity-[.6] disabled:cursor-not-allowed"
                    >
                      Apply now
                    </button>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
