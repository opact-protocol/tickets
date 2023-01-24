import { Tab } from "@headlessui/react";
import { Deposit } from "./deposit";
import { Withdraw } from "./withdraw";

const classNames = (...classes) => classes.filter(Boolean).join(" ");

export function Actions() {
  const tabs = ["Deposit", "Withdraw"];

  return (
    <div className="w-[95%] max-w-[479px] bg-white/80 px-4 py-6 rounded-[40px] border-[2px] border-solid border-white sm:px-0 mx-auto z-[3] relative">
      <Tab.Group
        as="div"
        className="flex flex-col items-center bg-white rounded-[30px] max-w-[431px] mx-auto p-8 shadow-sm border-[3px] border-solid border-[#616dd333]"
      >
        <Tab.List className="flex gap-4 p-6 max-w-[431px] w-screen rounded-[30px]">
          {tabs.map((tab) => (
            <Tab
              key={tab}
              className={({ selected }) =>
                classNames(
                  "w-full rounded-full py-2.5 text-md font-bold leading-5",
                  "ring-white ring-opacity-60 ring-offset-2 ring-offset-gray-100 focus:outline-none focus:ring-2",
                  selected
                    ? "text-white bg-soft-blue shadow"
                    : "bg-soft-blue-normal hover:bg-soft-blue/40 text-soft-blue"
                )
              }
            >
              {tab}
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels className="mt-2 w-full">
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
