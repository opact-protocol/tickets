import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";

export const WithdrawWarn = ({
  isOpen,
  closeModal = () => {},
}: {
  isOpen: boolean
  closeModal: () => void
}) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-[999]"
        onClose={() => {
          closeModal();
        }}
      >
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
              <Dialog.Panel className="w-full max-w-[520px] transform overflow-hidden rounded-[8px] border-[1px] border-[#606466] bg-form-gradient p-[24px] transition-all text-left space-y-[18px]">
                <Dialog.Title
                  as="h1"
                  className="text-white font-title text-[18px] font-[500]"
                >
                  Withdrawal ticket
                </Dialog.Title>

                <p
                  className="
                    pt-[16px]
                    text-[15px]
                    leading-[19.5px]
                    font-[500]
                    text-[#BDBDBD] w-full
                  "
                >
                  As this is your first time using Opact Tickets, <span className="underline">it may take longer than the usual.</span>
                </p>

                <p
                  className="
                    text-[15px]
                    leading-[19.5px]
                    font-[500]
                    text-[#BDBDBD] w-full
                  "
                >
                  We need to download the system checker, it ensures secure verification of transactions while protecting your private data.
                </p>

                <p
                  className="
                    text-[15px]
                    leading-[19.5px]
                    font-[500]
                    text-[#BDBDBD] w-full
                  "
                >
                  Thank you for your patience, we are doing this for your privacy and better UX!
                </p>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default WithdrawWarn
