import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

const TotalDepositsModal = ({
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
              <Dialog.Panel className="w-full max-w-[550px] transform overflow-hidden rounded-[35px] bg-white p-6 text-left align-middle shadow-xl transition-all relative">
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
                  Total deposits to date
                </Dialog.Title>

                <p className="text-dark-grafiti-medium text-lg max-w-[600px] mx-auto mb-10">
                  The total number of deposits that were made after your have
                  deposited. The more deposits, the more anonymity. We recommend
                  waiting at least 10 deposits before withdrawing yours.
                </p>
                <button
                  className="block mx-auto bg-soft-blue-from-deep-blue mt-[24px] p-[12px] mb-2 rounded-full w-full font-[400] hover:opacity-[.9]"
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

export default TotalDepositsModal;