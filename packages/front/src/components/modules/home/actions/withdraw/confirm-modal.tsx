import { useApplication } from "@/store";
import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useWallet } from "@/store/wallet";

export default function Modal({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { sendWithdraw } = useApplication();

  const { selector, accountId } = useWallet();

  const withdraw = () => {
    onClose();
    sendWithdraw(selector, accountId!);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => onClose()}>
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
              <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all space-y-2">
                <Dialog.Title
                  as="span"
                  className="text-black text-[18px] font-[500]"
                >
                  Withdraw Confirmation
                </Dialog.Title>

                <div className="mt-2 text-[16px] text-black space-y-[12px]">
                  <p>
                    Your zk-Snark proof has ben successfully generated! Please
                    click Confirm to initiate the withdraw
                  </p>
                </div>

                <div>
                  <button
                    onClick={() => withdraw()}
                    className="bg-soft-blue-from-deep-blue mt-[24px] p-[12px] rounded-full w-full font-[400] hover:opacity-[.9]"
                  >
                    Confirm
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
