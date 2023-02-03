import { Dialog, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Fragment, useState } from "react";
import { useNavigate } from "react-router";

const HeaderLanding = () => {
  const [open, setOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between py-4 relative z-10">
      <div className="relative z-10 flex items-center gap-16">
        <a href="/" aria-label="Home">
          <img className="h-6 w-auto" src="./assets/logo-horizontal.png" />
        </a>
      </div>
      <Bars3Icon
        className="text-black w-8 cursor-pointer lg:hidden"
        onClick={() => setOpen(true)}
      />
      <Transition.Root show={open} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[12] lg:hidden"
          onClose={setOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-500"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-500"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 left-0 flex">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-500 sm:duration-700"
                  enterFrom="translate-x-[-200px]"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-500 sm:duration-700"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-[-250px]"
                >
                  <Dialog.Panel
                    className="
                      shadow
                      shadow-sw-navbar
                      pointer-events-auto
                      relative w-[267px] h-screen bg-white rounded-tr-lg rounded-br-lg"
                  >
                    <div className="w-full h-[55px] flex p-4 px-5 items-center justify-between">
                      <button
                        type="button"
                        className="text-black hover:text-white focus:outline-none"
                        onClick={() => setOpen(false)}
                      >
                        <XMarkIcon
                          className="h-7 w-7 text-black"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                    <nav>
                      <ul className="flex flex-col gap-5 mt-4 justify-center tracking-tight ml-7">
                        <li
                          className="text-black font-bold text-base border-b-[1px] border-transparent"
                          onClick={() => setOpen(false)}
                        >
                          <a href="#how-it-works">How it works</a>
                        </li>
                        <li
                          className="text-black font-bold text-base border-b-[1px] border-transparent"
                          onClick={() => setOpen(false)}
                        >
                          <a href="#easy-to-use">How to use</a>
                        </li>
                        <li
                          className="text-black font-bold text-base border-b-[1px] border-transparent"
                          onClick={() => setOpen(false)}
                        >
                          <a href="">Documentation</a>
                        </li>
                        <li
                          className="text-black font-bold text-base border-b-[1px] border-transparent"
                          onClick={() => setOpen(false)}
                        >
                          <a href="#faq">FAQ</a>
                        </li>
                        <li className="text-white font-bold text-base">
                          <button
                            className="p-2 px-6 rounded-[20px] bg-aqua-gradient-medium cursor-pointer hover:opacity-70 hover:transition-all"
                            onClick={() => navigate("/hideyourcash")}
                          >
                            Launch app
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
      <nav className="hidden lg:block">
        <ul className="flex gap-10 items-center">
          <li className="text-black font-bold text-base border-b-[1px] border-transparent hover:border-black transition-all">
            <a href="#how-it-works">How it works</a>
          </li>
          <li className="text-black font-bold text-base border-b-[1px] border-transparent hover:border-black transition-all">
            <a href="#easy-to-use">How to use</a>
          </li>
          <li className="text-black font-bold text-base border-b-[1px] border-transparent hover:border-black transition-all">
            <a href="">Documentation</a>
          </li>
          <li className="text-black font-bold text-base border-b-[1px] border-transparent hover:border-black transition-all">
            <a href="#faq">FAQ</a>
          </li>
          <li className="text-white font-bold text-base">
            <button
              className="p-2 px-6 rounded-[20px] bg-aqua-gradient-medium cursor-pointer hover:opacity-70 hover:transition-all"
              onClick={() => navigate("/hideyourcash")}
            >
              Launch app
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default HeaderLanding;
