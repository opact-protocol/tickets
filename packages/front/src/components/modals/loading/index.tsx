import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";

export const LoadingModal = ({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
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
          <div className="fixed inset-0 bg-black bg-opacity-5" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-hidden">
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
              <Dialog.Panel className="w-screen h-screen flex items-center justify-center transform overflow-hidden p-6 text-left align-middle transition-all relative">
                <div className="flex flex-col items-center justify-center gap-3 w-full max-w-[450px] bg-white p-5 rounded-[35px] shadow-xl">
                  <div className="flex items-center justify-center gap-5">
                    <div className="w-[36px] h-[36px] border-[4px] border-dark-grafiti border-l-transparent rounded-[50%] animate-spin" />
                    <p className="text-dark-grafiti-medium text-lg font-bold">
                      Generating your zero knowledge proof
                    </p>
                  </div>
                  <p className="text-dark-grafiti-light text-base font-semibold text-center">
                    This may take a few seconds
                  </p>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
