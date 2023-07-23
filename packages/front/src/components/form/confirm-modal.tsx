import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Button } from "../button";

export default function Modal({
  isOpen,
  send,
  onClose,
  cleanupInputsCallback,
}: {
  send: () => void;
  isOpen: boolean;
  onClose: () => void;
  cleanupInputsCallback: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const withdraw = async () => {
    setLoading(true);
    await send();
    setLoading(false);
    cleanupInputsCallback();
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => onClose()}>
        <div className="fixed inset-0 overflow-y-auto modal-bg">
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
              <Dialog.Panel
                className="
                  w-full max-w-[423px] transform overflow-hidden rounded-[8px] bg-form-gradient p-[24px] text-left align-middle shadow-xl transition-all space-y-4 border-[1px] border-[#606466]
                "
              >
                <Dialog.Title
                  as="span"
                  className="font-title text-[18px] font-[500]"
                >
                  Withdraw Confirmation
                </Dialog.Title>

                <div className="text-[#BDBDBD] text-[15px] leading-[19.5px]">
                  <p>
                    Your zk-Snark proof has ben successfully generated! Please
                    click Confirm to initiate the withdraw
                  </p>
                </div>

                <div
                  className="pt-[32px]"
                >
                  <Button
                    text="Confirm"
                    isLoading={loading}
                    disabled={loading}
                    onClick={async () => await withdraw()}
                  />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
