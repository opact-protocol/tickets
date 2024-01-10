import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { ModuleState } from "@near-wallet-selector/core";
import { useEnv } from "@/hooks/useEnv";
import { useWallet } from "@/store/wallet";
import { reloadPage } from "@/utils/reloadPage";
import { Arrow } from "@/components/assets/arrow";

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
        <div className="fixed inset-0 overflow-y-auto modal-bg">
          <div className="flex min-h-full items-center justify-center p-4 text-center border-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-[8px] p-[24px] bg-form-gradient text-left align-middle transition-all border-[1px] border-[#606466]">
                <div className="flex flex-col mb-[16px]">
                  <Dialog.Title
                    className="text-[#FAFAFA] font-title text-[18px] font-[500]"
                  >
                    Connect Wallet
                  </Dialog.Title>
                </div>

                <div className="space-y-[16px] flex flex-col">
                  {modules.map((module) => (
                    <button
                      key={"wallet-selector-modal-module" + module.id}
                      onClick={() => handleWalletClick(module)}
                      className="group border border-[#606466] rounded-[8px] py-[12px] p-[16px] h-[56px] flex items-center hover:bg-[#606466] text-[16px] justify-between"
                    >
                      <div className="flex">
                        <img
                          src={module.metadata.iconUrl}
                          className="w-[24px] h-[24px] mr-[12px]"
                        />

                        <span
                          className="block text-white/[0.9]"
                        >
                          {module.metadata.name}
                        </span>
                      </div>

                      <Arrow
                        className="group-hover:rotate-[45deg] transition-all"
                      />
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
