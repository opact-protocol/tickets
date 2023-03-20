import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { WhitelistModal } from "./whitelist";

export const AboutUsModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
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
                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all relative">
                  <button
                    onClick={() => onClose()}
                    className="absolute right-[24px] top-[24px] hover:opacity-[0.7]"
                  >
                    <XMarkIcon className="text-black w-[24px]" />
                  </button>

                  <Dialog.Title
                    as="h1"
                    className="text-dark-grafiti-medium text-xl font-medium text-center font-['Sora']"
                  >
                    Welcome to
                  </Dialog.Title>

                  <h2 className="text-dark-grafiti-medium text-2xl font-extrabold text-center font-['Sora']">
                    Hide your Cash
                  </h2>
                  <p className="text-dark-grafiti-medium text-lg font-normal text-center mt-2">
                    The first privacy transactions platform currently deployed
                    on <strong>NEAR</strong>
                  </p>
                  <p className="text-dark-grafiti-medium text-lg font-normal text-center w-full max-w-[607px] mt-5 mb-16 mx-auto">
                    You`ll need to add yourself to the allowlist and then you`ll
                    be able to make transactions.
                  </p>

                  <button
                    className="max-w-[367px] block mx-auto bg-soft-blue-from-deep-blue mt-[24px] p-[12px] mb-10 rounded-full w-full font-[400] hover:opacity-[.9]"
                    onClick={() => {
                      onClose();
                      setOpen(true);
                    }}
                  >
                    Apply for allowlist
                  </button>
                  <p
                    className="text-soft-blue font-normal text-lg underline text-center mb-10 cursor-pointer"
                    onClick={() => onClose()}
                  >
                    I`ll do it later
                  </p>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      <WhitelistModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
};
