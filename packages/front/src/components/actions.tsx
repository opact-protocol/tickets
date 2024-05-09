import { Tab } from "@headlessui/react";
import {
  // Deposit,
  Withdraw } from "./form";

const classNames = (...classes) => classes.filter(Boolean).join(" ");

export function Actions() {
  const tabs = [
    // "Deposit",
    "Withdraw"
  ];

  return (
    <div
      className="
        w-[90%]
        min-w-[350px]
        sm:w-[480px]
        bg-form-gradient
        py-[24px] space-y-[24px]
        my-[240px]
        rounded-[12px] border-[2px] border-solid border-[#606466] mx-auto z-[3] relative
      "
    >
      <Tab.Group
        as="div"
        className="
          w-full px-[12px]
          space-y-[24px]
          flex flex-col items-center
        "
      >
        <Tab.List className="flex w-full">
          {tabs.map((tab, i) => (
            <div
              key={tab}
              className="flex"
            >
              <Tab
                className={({ selected }) =>
                  classNames(
                    'px-[12px] py-[8px] font-title text-[16px] font-[500] select-none outline-none',
                    selected
                      ? "text-white"
                      : "hover:text-white text-[#5B5F61] "
                  )
                }
              >
                {tab}
              </Tab>

              {/* { i % 2 === 0 &&
                <div
                  className="px-[16px] py-[5px] flex items-center justify-center"
                >
                  <div
                    className="h-[22px] w-[1px] bg-[#5B5F61]"
                  />
                </div>
              } */}
            </div>
          ))}
        </Tab.List>

        <Tab.Panels className="w-full px-[12px]">
          {/* <Tab.Panel>
            <Deposit />
          </Tab.Panel> */}

          <Tab.Panel>
            <Withdraw />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
