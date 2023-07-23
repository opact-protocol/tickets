import { Listbox, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import NeedHelpModal from "../modals/needHelp";
import { Help } from "../assets/help";

export const NeedHelp = () => {
  const [showModal, setShowModal] = useState<boolean>(false);

  return (
    <>
      <Listbox>
        <div className="relative">
          <Listbox.Button
            className="hover:opacity-[0.8]"
          >
            <Help/>
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options
              className="
                absolute w-[299px] h-[56px] right-0 top-[70px] dropdown-bg flex py-[15px] px-[30px]
                font-title text-[16px] leading-[24px]
                text-white justify-between
              "
            >
              <Listbox.Option
                value="FAQ"
                as="a"
                target="_blank"
                rel="noreferrer"
                href="https://docs.hideyour.cash/general-information/faq"
                className="opacity-[0.89] hover:opacity-[0.8]"
              >
                FAQ
              </Listbox.Option>

              <Listbox.Option
                value="Tutorials"
                as="a"
                target="_blank"
                rel="noreferrer"
                className="opacity-[0.89] hover:opacity-[0.8]"
                href="https://docs.hideyour.cash/how-to-use-hyc/tutorial"
              >
                Tutorials
              </Listbox.Option>

              <Listbox.Option
                as="a"
                value="Contact us"
                target="_blank"
                href="https://www.opact.io/#contact"
                className="opacity-[0.89] hover:opacity-[0.8]"
              >
                Contact us
              </Listbox.Option>
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
      {showModal && (
        <NeedHelpModal isOpen={showModal} onClose={() => setShowModal(false)} />
      )}
    </>
  );
};
