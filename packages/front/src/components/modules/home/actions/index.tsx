import { Tab } from "@headlessui/react";
import { Deposit } from "./deposit";
import { Withdraw } from "./withdraw";

const classNames = (...classes) => classes.filter(Boolean).join(" ");

export function Actions() {
  const tabs = ["Deposit", "Withdraw"];

  return (
    <div className="w-full px-2 py-16 sm:px-0 mx-auto z-[3] relative">
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

        <Tab.Panels className="mt-2">
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
