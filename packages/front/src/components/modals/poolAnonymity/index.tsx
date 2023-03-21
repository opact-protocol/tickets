import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export const WhatIsThisModal = ({
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
              <Dialog.Panel className="w-full max-w-[650px] transform overflow-hidden rounded-[35px] bg-white p-6 text-left align-middle shadow-xl transition-all relative">
                <button
                  onClick={() => onClose()}
                  className="absolute right-[24px] top-[24px] hover:opacity-[0.7]"
                >
                  <XMarkIcon className="text-black w-[24px]" />
                </button>

                <Dialog.Title
                  as="h1"
                  className="text-dark-grafiti-medium text-xl font-bold text-center mb-10"
                >
                  What is anonymity score ?
                </Dialog.Title>
                <p className="text-dark-grafiti-medium text-lg max-w-[450px] text-center mx-auto mb-10">
                  The anonymity score shows how hard it would be to track a
                  transaction on hideyour.cash. {"\n"}
                  
                  To learn more about anonymity best practices <a className="text-soft-blue" href="https://docs.hideyour.cash/how-to-use-hyc/enhanced-anonymity" target="_blank" rel="noopener noreferrer">check out the docs</a>.
                </p>
                <ul className="list-disc list-inside justify-center text-dark-grafiti-medium text-lg max-w-[450px] mx-auto mb-10">
                  <li className="text-left">Level one protects against regular users</li>
                  <li className="text-left">Level two protects against advanced robots</li>
                  <li className="text-left">Level three protects against spy-grade analytics</li>
                </ul>
                <button
                  className="max-w-[367px] block mx-auto bg-soft-blue-from-deep-blue mt-[24px] p-[12px] mb-5 rounded-full w-full font-[400] hover:opacity-[.9]"
                  onClick={() => onClose()}
                >
                  Close
                </button>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
