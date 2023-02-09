import HashModal from "./hash-modal";
import { Fragment, useState } from "react";
import { RadioGroup, Listbox, Transition } from "@headlessui/react";
import { useApplication } from "@/store/application";
import { useWalletSelector } from "@/utils/context/wallet";
import {
  QuestionMarkCircleIcon,
  ChevronDownIcon
} from "@heroicons/react/24/outline";
import { FixedValuesModal } from "@/components/modals/fixedValues";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import { WhitelistModal } from "@/components/modals";
import { useAllowlist } from "@/hooks/useAllowlist";
import { useAction } from "@/hooks/useAction";
import { toast } from "react-toastify";
import { ToastCustom } from "@/components/shared/toast-custom";
import { returnMessages } from "@/utils/returnMessages";

const transactionHashes = new URLSearchParams(window.location.search).get(
  "transactionHashes"
);

const hycTransaction = "hyc-transaction";

const amounts = [0.1, 1, 10, 20, 50];

const tokens = [
  { id: 1, name: "NEAR" },
  { id: 2, name: "AVAX" },
  { id: 3, name: "BTC" },
  { id: 4, name: "CARDANO" }
];

const customId = "deposit-toast";

export function Deposit() {
  const [showModal, setShowModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number>(10);
  const [buttonText, setButtonText] = useState("Deposit");
  const [depositing, setDepositing] = useState(false);
  const [selectedToken, setSelectedToken] = useState<any>();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showAllowlist, setShowAllowlist] = useState(false);

  const { prepareDeposit } = useApplication();
  const { selector, accountId, toggleModal } = useWalletSelector();
  const { action } = useAction(transactionHashes!, accountId!);
  const approved = localStorage.getItem(hycTransaction);

  if (!action && transactionHashes && !approved) {
    toast(
      <ToastCustom
        icon="processing"
        message="This process could take a few moments"
        title="Processing"
      />,
      {
        toastId: customId
      }
    );
  } else if (!approved && transactionHashes) {
    const { message, title } = returnMessages(action!);
    toast.update(customId, {
      render: () => (
        <ToastCustom
          icon={
            action?.status === "success"
              ? "/check-circle-icon.svg"
              : "/error-circle-icon.svg"
          }
          title={title}
          message={message}
        />
      )
    });
  }

  const { allowList } = useAllowlist(accountId!, selector);

  const { allowList } = useAllowlist(accountId!, selector);

  const preDeposit = async () => {
    if (!accountId) {
      toggleModal();

      return;
    }

    if (!selectedToken) {
      setErrorMessage("Select token to deposit");
      return;
    }

    if (!allowList) {
      setShowAllowlist(true);
      return;
    }

    setDepositing(true);
    setButtonText("Preparing your deposit...");

    await prepareDeposit(selector, accountId!);

    setShowModal(!showModal);
  };

  return (
    <>
      <div>
        <div>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-black text-[1.1rem] font-bold">
                Choose token{" "}
                <span className="text-error">{errorMessage && "*"}</span>
              </span>
            </div>
            <Listbox value={selectedToken} onChange={setSelectedToken}>
              <div className="relative mt-1">
                <Listbox.Button
                  className={`cursor-pointer relative w-full rounded-[15px] bg-soft-blue-normal py-3 pl-3 pr-10 text-left border-[2px] ${
                    errorMessage ? "border-error" : "border-transparent"
                  } focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm`}
                >
                  <span className="block truncate text-dark-grafiti font-normal">
                    {selectedToken && selectedToken.name
                      ? selectedToken.name
                      : "Select token"}
                  </span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronDownIcon
                      className="h-5 w-5 text-gray-400 font-bold"
                      aria-hidden="true"
                    />
                  </span>
                </Listbox.Button>
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute mt-1 max-h-60 w-[240px] overflow-auto rounded-[20px] bg-white py-1 text-base shadow-[0_4px_15px_rgba(0,0,0,0.2)] ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-[10]">
                    {tokens.map((token, i) => (
                      <Listbox.Option
                        key={token.id}
                        disabled={token.id !== 1}
                        className={({ active }) =>
                          `relative ${
                            i === 0 ? "cursor-pointer" : "cursor-not-allowed"
                          } select-none p-[10px] mx-auto w-[220px] ${
                            active
                              ? "bg-soft-blue-normal rounded-[10px] text-dark-grafiti"
                              : "text-dark-grafiti"
                          }`
                        }
                        value={token}
                      >
                        {({ selected }) => (
                          <>
                            <span
                              className={`flex gap-2 truncate text-black font-bold`}
                            >
                              <div
                                className={`w-4 h-4  rounded-[50%] ${
                                  selected ? "bg-success" : "bg-gray-300"
                                }`}
                              />{" "}
                              {i === 0
                                ? token.name
                                : `${token.name}, coming soon`}
                            </span>
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>
          </div>

          {selectedToken ? (
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <span className="text-black text-[1.1rem] font-bold ">
                  Amount{" "}
                  {/*<span className="text-error">{errorMessage && "*"}</span> */}
                </span>
              </div>

              <RadioGroup
                value={selectedAmount}
                onChange={setSelectedAmount}
                className="mt-2 max-w-[371px]"
              >
                <Swiper spaceBetween={40} slidesPerView={3} className="flex">
                  {amounts.map(size => (
                    <SwiperSlide key={size}>
                      <RadioGroup.Option
                        key={size}
                        value={size}
                        as="div"
                        className={({ checked }) => `
                              bg-transparent rounded-full p-1 w-[132px] mb-2 ${
                                size === 10 ? "bg-soft-blue-from-deep-blue" : ""
                              }
                            `}
                      >
                        <div className="bg-white p-2 shadow-sm rounded-full w-[125px] flex items-center justify-center cursor-not-allowed">
                          <RadioGroup.Label
                            as="span"
                            className="whitespace-nowrap space-x-[4px] font-bold text-soft-blue"
                          >
                            {size} NEAR
                          </RadioGroup.Label>
                        </div>
                      </RadioGroup.Option>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </RadioGroup>
              <p
                className="text-info font-normal text-sm underline flex items-center gap-2 cursor-pointer mt-2"
                onClick={() => setIsOpen(true)}
              >
                Why use fixed values{" "}
                <QuestionMarkCircleIcon className="w-4 h-4" />
              </p>
            </div>
          ) : null}

          <div className="mt-16 mb-16">
            <div className="flex items-center justify-between">
              <span className="text-black text-[1.1rem] font-bold ">
                Transaction Anonimity
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              {[1, 2, 3].map(item => (
                <div
                  key={item}
                  className="w-[77px] h-[9px] bg-gray-300 rounded-full"
                />
              ))}
            </div>
            <p
              className="text-info font-normal text-sm underline flex items-center gap-2 mt-2 cursor-not-allowed"
              title="Coming soon"
            >
              What is this <QuestionMarkCircleIcon className="w-4 h-4" />
            </p>
          </div>

          <p className="text-error ml-2 text-sm font-normal">{errorMessage}</p>
          <button
            disabled={depositing}
            onClick={() => preDeposit()}
            className="bg-soft-blue-from-deep-blue p-[12px] rounded-full w-full font-[400] hover:opacity-[.9] disabled:opacity-[.6] disabled:cursor-not-allowed"
          >
            {!accountId ? "Connect Wallet" : buttonText}
          </button>

          <HashModal
            isOpen={showModal}
            amount={selectedAmount.toString()}
            onClose={() => {
              setDepositing(false);
              setShowModal(!showModal);
              setButtonText("Deposit");
            }}
          />
          <FixedValuesModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </div>
      </div>
      <WhitelistModal
        isOpen={showAllowlist}
        onClose={() => setShowAllowlist(false)}
      />
    </>
  );
}
