import { Tab } from "@headlessui/react";
import { useState } from "react";
import { Deposit } from "./deposit";
import { Withdraw } from "./withdraw";

const classNames = (...classes) => classes.filter(Boolean).join(" ");

export function Actions() {
  const tabs = ["Deposit", "Withdraw"];
  const [changingTab, setChangingTab] = useState(false);

  return (
    <div className="w-[95%] max-w-[479px] bg-background-page px-4 py-6 rounded-[40px] border-[2px] border-solid border-white sm:px-0 mx-auto z-[3] relative">
      <Tab.Group
        as="div"
        className="flex flex-col items-center max-w-[431px] bg-white rounded-[30px] mx-auto p-8 shadow-sm border-[3px] border-solid border-[#616dd333]"
      >
        <Tab.List className="flex gap-4 py-6 w-full rounded-[30px]">
          {tabs.map(tab => (
            <Tab
              key={tab}
              className={({ selected }) =>
                classNames(
                  "w-full rounded-full py-2.5 text-md font-bold leading-5",
                  "ring-white ring-opacity-60 ring-offset-2  ring-offset-gray-100 hover:transition-colors focus:outline-none focus:ring-2",
                  selected
                    ? "text-white bg-soft-blue hover:bg-soft-blue-light"
                    : "bg-soft-blue-normal hover:bg-hover-button text-soft-blue"
                )
              }
            >
              {tab}
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels className="mt-2 w-full">
          <Tab.Panel>
            <Deposit changingTab={changingTab} />
          </Tab.Panel>
          <Tab.Panel>
            <Withdraw setChangingTab={setChangingTab} />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
