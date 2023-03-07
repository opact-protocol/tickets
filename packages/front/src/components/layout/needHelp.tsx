import { Listbox, Transition } from "@headlessui/react";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { Fragment, useState } from "react";
import NeedHelpModal from "../modals/needHelp";

export const NeedHelp = () => {
  const [showModal, setShowModal] = useState<boolean>(false);

  return (
    <>
      <Listbox>
        <div className="absolute top-[9.5rem] right-7 xl:right-16 md:top-36 mt-1 z-50">
          <Listbox.Button className="flex items-center justify-center gap-2 px-2 rounded-[20px] text-soft-blue text-sm font-normal bg-white border-[2px] border-soft-blue p-1">
            Need help <QuestionMarkCircleIcon className="w-4 h-4" />
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="mt-1 flex flex-col w-full max-w-[110px] gap-2 max-h-60 overflow-auto rounded-[15px] bg-white py-2 px-2 text-base shadow-[0_4px_15px_rgba(0,0,0,0.2)] ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-[10]">
              <Listbox.Option
                value="FAQ"
                className={({ active }) =>
                  `text-sm text-dark-grafiti cursor-pointer px-2 ${
                    active ? "hover:bg-soft-blue-normal rounded-[5px]" : ""
                  }`
                }
                as="a"
                href="/#faq"
              >
                FAQ
              </Listbox.Option>
              <Listbox.Option
                value="Tutorials"
                className={({ active }) =>
                  `text-sm text-dark-grafiti cursor-pointer px-2 ${
                    active ? "hover:bg-soft-blue-normal rounded-[5px]" : ""
                  }`
                }
                as="a"
                target="_blank"
                href="https://www.youtube.com/watch?v=82ICG4BEtNk"
              >
                Tutorials
              </Listbox.Option>
              <Listbox.Option
                value="Contact us"
                className={({ active }) =>
                  `${active ? "hover:bg-soft-blue-normal rounded-[5px]" : ""}`
                }
              >
                <button
                  className="text-sm text-dark-grafiti px-2"
                  onClick={() => setShowModal(true)}
                >
                  Contact us
                </button>
              </Listbox.Option>
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
      <NeedHelpModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
};
