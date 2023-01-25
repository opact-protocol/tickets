import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

const VerifyAddressModal = ({
  isOpen,
  onClose,
  status,
}: {
  isOpen: boolean;
  onClose: () => void;
  status: string;
}) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
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
              <Dialog.Panel className="w-full max-w-[873px] transform overflow-hidden rounded-[35px] bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="img"
                  src={
                    status === "success"
                      ? "/check-circle-icon.svg"
                      : "/error-circle-icon.svg"
                  }
                  className="mx-auto mt-[79px] mb-[34px]"
                />

                <h1 className="text-dark-grafiti-medium font-bold text-xl font-[Sora] text-center mb-[11px]">
                  {status === "success"
                    ? "Address verified succesfully!"
                    : "Address denied"}
                </h1>
                <p className="text-dark-grafiti-medium text-base font-normal text-center">
                  {status === "success"
                    ? "Now you can close and start making anonymous transactions with safety."
                    : "Something went wrong with your address"}
                </p>
                <button
                  className="block mx-auto bg-soft-blue-from-deep-blue p-[12px] mt-[32px] mb-[73px] rounded-full w-full max-w-[184px] font-normal hover:opacity-[.9] disabled:opacity-[.6] disabled:cursor-not-allowed"
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

export default VerifyAddressModal;
