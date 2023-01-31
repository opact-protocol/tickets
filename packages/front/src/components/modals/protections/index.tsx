import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

const protections = {
  "account balance display": {
    message: "Don’t let people know how much money you have!",
  },
  "transactions tracking": {
    message: "No one needs to know what you have been doing on chain!",
  },
  "profile analysis": {
    message:
      "Not a good idea to have people analyzing your profile based on on chain activity!",
  },
  "wallet connections tracking": {
    message:
      "You don’t want everybody to know who you have been transacting lately!",
  },

  "portfolio tracking": {
    message:
      "Especially for institutions, you don’t want to have your portfolio tracked by other players!",
  },
  "front run": {
    messages:
      "If you’re a big investor, it’s better to be hidden to prevent front run attacks.",
  },
};

export const ProtectionModal = ({
  isOpen,
  onClose,
  protection,
}: {
  isOpen: boolean;
  protection: string;
  onClose: () => void;
}) => {
  const { message } = protections[protection.toLocaleLowerCase()];

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
                  {protection}
                </Dialog.Title>
                <p className="text-dark-grafiti-medium text-lg max-w-[600px] mx-auto mb-32 text-center">
                  {message}
                </p>
                <button
                  className="max-w-[367px] block mx-auto bg-aqua-gradient-medium mt-[24px] p-[12px] mb-28 rounded-full w-full font-[400] hover:opacity-[.9]"
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
