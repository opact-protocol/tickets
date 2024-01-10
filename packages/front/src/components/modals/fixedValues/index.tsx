import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";

export const FixedValuesModal = ({
  isOpen,
  onClose,
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
              <Dialog.Panel className="max-w-[294px] border-[1px] border-[#606466] transform overflow-hidden rounded-[8px] w-screen bg-form-gradient p-[12px] text-left transition-all relative">
                <Dialog.Title
                  as="h1"
                  className="text-[16px] leading-[22px]"
                >
                  Why use fixed values ?
                </Dialog.Title>

                <p className="text-white leading-[18px] text-[14px] pt-[8px]">
                  Fixed values guarantee the standardization of transactions, making detection of the source wallet much more difficult. In this way, further ensuring the anonymity and security of your transaction.
                </p>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
