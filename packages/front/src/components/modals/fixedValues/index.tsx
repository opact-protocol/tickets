import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

const amounts = [0.1, 1, 10, 20, 50];

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
              <Dialog.Panel className="w-full max-w-[873px] transform overflow-hidden rounded-[35px] bg-white p-6 text-left align-middle shadow-xl transition-all relative">
                <button
                  onClick={() => onClose()}
                  className="absolute right-[24px] top-[24px] hover:opacity-[0.7]"
                >
                  <XMarkIcon className="text-black w-[24px]" />
                </button>

                <Dialog.Title
                  as="h1"
                  className="text-dark-grafiti-medium text-xl font-bold text-center mb-20"
                >
                  Why use fixed values ?
                </Dialog.Title>

                <div className="flex items-center justify-center gap-5 mb-20">
                  {amounts.map((amount, i) => (
                    <>
                      <div
                        key={i}
                        className={`bg-transparent rounded-full p-1 ${
                          i === 1 ? "bg-soft-blue-from-deep-blue" : ""
                        }`}
                      >
                        <div
                          key={i}
                          className={`bg-white p-2 shadow-sm rounded-full w-[125px] flex items-center justify-center cursor-pointer`}
                        >
                          <span className="whitespace-nowrap space-x-[4px] font-bold text-soft-blue">
                            {amount} NEAR
                          </span>
                        </div>
                      </div>
                    </>
                  ))}
                </div>
                <p className="text-dark-grafiti-medium text-lg max-w-[600px] mx-auto mb-32">
                  Fixed values ​guarantee the standardization of transactions,
                  making detection of the source wallet much more difficult. In
                  this way, further ensuring the anonymity and security of your
                  transaction.
                </p>
                <button
                  className="max-w-[367px] block mx-auto bg-soft-blue-from-deep-blue mt-[24px] p-[12px] mb-28 rounded-full w-full font-[400] hover:opacity-[.9]"
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
