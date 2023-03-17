import { useApplication } from "@/store";
import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";

export default function Modal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { sendWithdraw } = useApplication();
  const [loading, setLoading] = useState(false);

  const withdraw = async () => {
    setLoading(true);
    await sendWithdraw();
    setLoading(false);
    onClose();
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
                    onClick={async () => await withdraw()}
                    className="bg-soft-blue-from-deep-blue mt-[24px] p-[12px] rounded-full w-full font-[400] hover:opacity-[.9]"
                  >
                    {loading ? (
                      <>
                        <div className="flex items-center justify-center w-full my-auto text-black">
                          <svg
                            className="animate-spin h-6 w-6 border border-l-current rounded-full"
                            viewBox="0 0 24 24"
                          />
                        </div>
                      </>
                    ) : (
                      "Confirm"
                    )}
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
