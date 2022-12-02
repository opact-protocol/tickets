import { useApplication } from "@/store";
import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useWalletSelector } from "@/utils/context/wallet";

export default function Modal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [sending, setSending] = useState(false);
  const [buttonText, setButtonText] = useState("Send Deposit");
  const { selector, accountId } = useWalletSelector();

  const { note, sendDeposit } = useApplication();

  const closeModal = () => {
    if (sending) {
      return;
    }

    onClose();
  };

  const deposit = async () => {
    setSending(true);
    setButtonText("Sending your Deposit...");

    try {
      await sendDeposit(selector, accountId!);

      closeModal();
      setSending(false);
      setButtonText("Send Deposit");
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
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
                  as="span"
                  className="text-[#121315] text-[18px] font-[500]"
                >
                  Your Hash
                </Dialog.Title>

                <div className="mt-2 text-[16px] text-[#121315] space-y-[12px]">
                  <p>
                    Your deposit hash is very important. you need it later to
                    withdraw your deposit.
                  </p>
                </div>

                <div>
                  <p className="text-[16px] text-[#121315]">Your hash:</p>
                  <p className="break-words text-[#121315] font-[800]">
                    {note}
                  </p>
                </div>

                <div>
                  <button
                    disabled={sending}
                    children={buttonText}
                    onClick={() => deposit()}
                    className="bg-[#121315] mt-[24px] p-[12px] rounded-full w-full font-[400] hover:opacity-[.9] disabled:opacity-[.6] disabled:cursor-not-allowed"
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
