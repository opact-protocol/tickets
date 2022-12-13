import { Tab } from "@headlessui/react";
import { useState } from "react";
import { Deposit } from "./deposit";
import { Withdraw } from "./withdraw";
import { AboutUsModal } from "@/components/modals";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

const classNames = (...classes) => classes.filter(Boolean).join(" ");

export function Actions() {
  const tabs = ["Deposit", "Withdraw"];

  const [showModal, setShowModal] = useState(false);

  return (
    <div className="w-full px-2 py-16 sm:px-0 mx-auto z-[3] relative">
      <AboutUsModal isOpen={showModal} onClose={() => setShowModal(false)} />
      <Tab.Group as="div" className="flex flex-col items-center">
        <Tab.List className="flex space-x-1 rounded-xl bg-white p-1 max-w-md w-screen">
          {tabs.map((tab) => (
            <Tab
              key={tab}
              className={({ selected }) =>
                classNames(
                  "w-full rounded-lg py-2.5 text-sm font-medium leading-5",
                  "ring-white ring-opacity-60 ring-offset-2 ring-offset-gray-100 focus:outline-none focus:ring-2",
                  selected
                    ? "text-white bg-[#121315] shadow"
                    : "text-blue-100 hover:bg-white/[0.12] text-[#131415]"
                )
              }
              children={tab}
            />
          ))}
        </Tab.List>

        <Tab.Panels className="mt-2 relative">
          <button
            className="text-black absolute right-[33.750px] top-[30px] hover:opacity-[0.8]"
            onClick={() => setShowModal(true)}
          >
            <QuestionMarkCircleIcon className="text-black w-[24px]" />
          </button>

          <Tab.Panel>
            <Deposit />
          </Tab.Panel>
          <Tab.Panel>
            <Withdraw />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
