import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { ModuleState } from "@near-wallet-selector/core";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { useEnv } from "@/hooks/useEnv";
import { useWallet } from "@/store";
import { reloadPage } from "@/utils/reloadPage";

export function WalletSelectorModal() {
  const { selector, showWalletModal, toggleModal } = useWallet();

  const [modules, setModules] = useState<ModuleState[]>([]);

  useEffect(() => {
    const subscription = selector?.store.observable.subscribe((state) => {
      state.modules.sort((current, next) => {
        if (current.metadata.deprecated === next.metadata.deprecated) {
          return 0;
        }

        return current.metadata.deprecated ? 1 : -1;
      });

      setModules(state.modules);
    });
    return () => subscription?.unsubscribe();
  }, [selector]);

  const handleWalletClick = async (module: ModuleState) => {
    try {
      const { available } = module.metadata;

      if (module.type === "injected" && !available) {
        return;
      }

      const wallet = await module.wallet();

      if (wallet.type === "hardware") {
        return;
      }
      await wallet.signIn({
        contractId: useEnv("VITE_CONTRACT"),
        methodNames: [],
      });

      reloadPage(wallet.id);
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <Transition appear show={showWalletModal} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => toggleModal()}>
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex flex-col mb-[12px]">
                  <Dialog.Title className="text-[#121315] text-[18px] font-[500]">
                    Connect Wallet
                  </Dialog.Title>
                </div>

                <div className="space-y-[12px] flex flex-col">
                  {modules.map((module) => (
                    <button
                      key={"wallet-selector-modal-module" + module.id}
                      onClick={() => handleWalletClick(module)}
                      className="border border-[#e0e1e4] rounded-[13px] py-[12px] px-[24px] h-[56px] flex items-center hover:bg-gray-100 text-[16px] text-[#121315] justify-between"
                    >
                      <div className="flex">
                        <img
                          src={module.metadata.iconUrl}
                          className="w-[20px] mr-[12px]"
                        />

                        {module.metadata.name}
                      </div>

                      <ChevronRightIcon className="w-[18px]" />
                    </button>
                  ))}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
