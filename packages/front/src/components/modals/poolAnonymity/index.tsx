import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";

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
              <Dialog.Panel className="w-full max-w-[362px] transform overflow-hidden rounded-[8px] bg-form-gradient border-[1px] border-[#606466] p-[12px] text-left transition-all relative">
                <Dialog.Title
                  as="h1"
                  className="text-white text-[16px] font-[700] text-leading-[22px]"
                >
                  What is anonymity score ?
                </Dialog.Title>

                <p className="text-white text-[14px] leading-[18px] pt-[8px]">
                  The anonymity score shows how hard it would be to track a
                  transaction on Opact Tickets. {"\n"}

                  To learn more about anonymity best practices <a className="underline" href="https://docs.hideyour.cash/how-to-use-hyc/enhanced-anonymity" target="_blank" rel="noopener noreferrer">check out the docs</a>.
                </p>

                <ul className="list-disc list-inside justify-center text-[14px] leading-[18px] pt-[8px] pt-[8px]">
                  <li className="text-left">Level one protects against regular users</li>
                  <li className="text-left">Level two protects against advanced robots</li>
                  <li className="text-left">Level three protects against spy-grade analytics</li>
                </ul>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
