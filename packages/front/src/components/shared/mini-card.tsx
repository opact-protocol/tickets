import { Disclosure, Transition } from "@headlessui/react";
import { ChevronUpIcon } from "@heroicons/react/24/outline";

const protections = {
  "account balance display": {
    message: "Don’t let people know how much money you have!"
  },
  "transactions tracking": {
    message: "No one needs to know what you have been doing on chain!"
  },
  "profile analysis": {
    message:
      "Not a good idea to have people analyzing your profile based on on-chain activity!"
  },
  "wallet connections tracking": {
    message:
      "You don’t want everybody to know who you have been transacting lately!"
  },

  "portfolio tracking": {
    message:
      "Especially for institutions, you don’t want to have your portfolio tracked by other players!"
  },
  "front run": {
    message:
      "If you’re a big investor, it’s better to be hidden to prevent front-run attacks."
  }
};

const MiniCard = ({
  title,
  protection
}: {
  title: string;
  protection: string;
}) => {
  const { message } = protections[protection.toLocaleLowerCase()];

  return (
    <div className="w-full px-4 mb-[10px]">
      <div className="rounded-[20px] bg-white shadow-md">
        <Disclosure>
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full items-center justify-between px-16 py-5 font-bold text-xl text-black">
                <div className="w-full flex gap-5 items-center">
                  <img src="/shield-check.svg" alt="" />
                  <p className="w-full text-start">{title}</p>
                </div>
                <ChevronUpIcon
                  className={`${
                    open ? "rotate-180 transform" : ""
                  } h-5 w-5 text-purple-500`}
                />
              </Disclosure.Button>
              <Transition
                show={open}
                enter="transition duration-100 ease-out"
                enterFrom="transform scale-95 opacity-0"
                enterTo="transform scale-100 opacity-100"
                leave="transition duration-75 ease-out"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0"
              >
                <Disclosure.Panel className="border-t-[1px] border-dark-grafiti mx-16 py-5 text-lg text-dark-grafiti">
                  {message}
                </Disclosure.Panel>
              </Transition>
            </>
          )}
        </Disclosure>
      </div>
    </div>
  );
};

export default MiniCard;
