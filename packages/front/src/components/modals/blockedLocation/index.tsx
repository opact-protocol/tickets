import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import NeedHelpModal from "../needHelp";

export const BlockecLocationModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [showModalNeedHelp, setShowModalNeedHelp] = useState(false);
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
                <Dialog.Panel className="w-full max-w-[700px] transform overflow-hidden rounded-[35px] bg-white p-6 text-left align-middle shadow-xl transition-all relative">
                  <Dialog.Title
                    as="h1"
                    className="text-dark-grafiti-medium text-xl font-bold text-center mb-1"
                  >
                    Temporary US Block
                  </Dialog.Title>
                  <p className="text-dark-grafiti-medium text-center text-lg max-w-[650px] mx-auto my-5 leading-[2.15rem]">
                    Sorry, access to this page is currently unavailable to users
                    located in the United States due to regulatory uncertainty
                    in the country. Our legal team is currently researching this
                    matter and we hope to be able to provide access to US users
                    soon. Please note that our service implements robust
                    anti-money laundering (AML) features to prevent money
                    launderers, hackers, and criminals from using it. If you
                    have any questions or concerns, please feel free to contact
                    our team at{" "}
                    <span
                      className="text-dark-grafiti-medium text-center text-lg underline cursor-pointer"
                      onClick={() => setShowModalNeedHelp(true)}
                    >
                      Contact us
                    </span>
                    . We apologize for any inconvenience this may cause and
                    thank you for your understanding.
                  </p>
                  <a
                    className="max-w-[358px] text-center block mx-auto bg-soft-blue-from-deep-blue mt-[24px] p-[12px] mb-5 rounded-full w-full font-[400] hover:opacity-[.9]"
                    href="/"
                  >
                    Back to landing page
                  </a>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      <NeedHelpModal
        isOpen={showModalNeedHelp}
        onClose={() => setShowModalNeedHelp(false)}
      />
    </>
  );
};
