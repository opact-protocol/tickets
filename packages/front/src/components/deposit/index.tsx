import HashModal from "./hash-modal";
import { Fragment, useEffect, useState } from "react";
import { RadioGroup, Listbox, Transition } from "@headlessui/react";
import {
  QuestionMarkCircleIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { FixedValuesModal } from "@/components/modals/fixedValues";
import { WhitelistModal } from "@/components/modals";
import { useAction } from "@/hooks/useAction";
import { toast } from "react-toastify";
import { ToastCustom } from "@/components/toast-custom";
import { returnMessages } from "@/utils/returnMessages";
import { useWallet } from "@/store/wallet";
import { WhatIsThisModal } from "@/components/modals/poolAnonymity";
import { useDeposit, useModal, useApp } from "@/store";
import { getDecimals, formatBigNumberWithDecimals } from "hideyourcash-sdk";

const transactionHashes = new URLSearchParams(window.location.search).get(
  "transactionHashes"
);

const hycTransaction = "hyc-transaction";

const customId = "deposit-toast";

export function Deposit() {
  const [showModalPoolAnonymity, setShowModalPoolAnonymity] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [haveBalance, setHaveBalance] = useState(true);
  const { accountId, toggleModal } = useWallet();
  const { allCurrencies, nearBalance, tokenBalance } = useApp();
  const {
    setSelectedToken,
    setSelectedAmount,
    setAllowlistModal,
    formatAmounts,
    poolDepositScore,
    preDeposit,
    selectedToken,
    selectedAmount,
    depositScore,
    errorMessage,
    showAllowlistModal,
    buttonText,
    depositing,
  } = useDeposit();
  const hashModal = useModal((state) => state.hashModal);
  const toggleHashModal = useModal((state) => state.toggleHashModal);
  const amounts = formatAmounts(selectedToken.contracts);
  const approved = localStorage.getItem(hycTransaction);
  const { action } = useAction(transactionHashes!, accountId!);

  if (!action && transactionHashes && !approved) {
    toast(
      <ToastCustom
        icon="processing"
        message="This process could take a few moments"
        title="Processing"
      />,
      {
        toastId: customId,
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
      ),
    });
  }

  const handleDeposit = async () => {
    if (!accountId) {
      toggleModal();
      return;
    }
    await preDeposit(haveBalance);
  };

  useEffect(() => {
    if (!selectedAmount.value) {
      return;
    }
    poolDepositScore();
  }, [selectedAmount]);

  return (
    <>
      <div>
        <div>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-black text-[1.1rem] font-bold">
                Choose token{" "}
                <span className="text-error">
                  {errorMessage.includes("token") && "*"}
                </span>
              </span>
            </div>
            <Listbox
              value={selectedToken}
              onChange={(payload) => {
                setSelectedToken(payload);
                setSelectedAmount({} as any);
                setHaveBalance(true)
              }}
            >
              <div className="relative mt-1">
                <Listbox.Button
                  className={`cursor-pointer relative w-full rounded-[15px] bg-soft-blue-normal py-3 pl-3 pr-10 text-left border-[2px] ${
                    errorMessage.includes("token")
                      ? "border-error"
                      : "border-transparent"
                  } focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm`}
                >
                  <span className="flex gap-2 items-center truncate text-dark-grafiti font-normal">
                    {selectedToken && selectedToken.type === "Near" && (
                      <>
                        <img
                          src={
                            selectedToken.type === "Near"
                              ? "./assets/near-logo.png"
                              : selectedToken.metadata.icon!
                          }
                          alt={
                            selectedToken.type === "Near"
                              ? "Near"
                              : selectedToken.metadata.name!
                          }
                          className="w-5 rounded-full"
                        />
                        {selectedToken.type === "Near"
                          ? selectedToken.type
                          : selectedToken.metadata.name!}
                      </>
                    )}

                    {selectedToken && selectedToken.metadata && (
                      <>
                        <img
                          src={
                            selectedToken.type === "Near"
                              ? "./assets/near-logo.png"
                              : selectedToken.metadata.icon!
                          }
                          alt={
                            selectedToken.type === "Near"
                              ? "Near"
                              : selectedToken.metadata.name!
                          }
                          className="w-5 rounded-full"
                        />
                        {selectedToken.type === "Near"
                          ? selectedToken.type
                          : selectedToken.metadata.name!}
                      </>
                    )}

                    {(!selectedToken || !selectedToken.type) && "Select token"}
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
                    {allCurrencies?.map((token) => (
                      <Listbox.Option
                        key={token.type}
                        className={({ active }) =>
                          `relative cursor-pointer select-none p-[10px] mx-auto w-[220px] ${
                            active
                              ? "bg-soft-blue-normal rounded-[10px] text-dark-grafiti"
                              : "text-dark-grafiti"
                          }`
                        }
                        value={token}
                      >
                        <span
                          className={`flex gap-2 truncate text-black font-bold`}
                        >
                          <img
                            src={
                              token.type === "Near"
                                ? "./assets/near-logo.png"
                                : token.metadata.icon!
                            }
                            alt=""
                            className="w-5 rounded-full"
                            loading="lazy"
                          />{" "}
                          {token.type === "Near"
                            ? token.type
                            : token.metadata.name!}
                        </span>
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>
          </div>

          {selectedToken.type ? (
            <div className="mt-8">
              <div className="flex flex-col items-start justify-center w-full">
                <span className="text-black text-[1.1rem] font-bold ">
                  Amount{" "}
                  <span className="text-error">{errorMessage && "*"}</span>
                </span>
                {!haveBalance && (
                  <span className="text-error text-sm font-normal">
                    {"Your account doesn't have enough balance"}
                  </span>
                )}
              </div>

              <RadioGroup
                value={selectedAmount}
                onChange={(payload) => {
                  if (selectedToken.type === "Near") {
                    setHaveBalance(() => nearBalance > +payload.value);
                  } else {
                    setHaveBalance(() => tokenBalance > +payload.value);
                  }
                  setSelectedAmount(payload);
                }}
                className="mt-2 max-w-[371px] flex"
                as="ul"
              >
                {amounts?.map((token) => (
                  <RadioGroup.Option
                    key={token.accountId}
                    value={token}
                    as="li"
                    className={() => `
                      bg-transparent rounded-full p-1 w-min mb-2 grow ${
                        selectedAmount.accountId === token.accountId
                          ? "bg-soft-blue-from-deep-blue"
                          : ""
                      }
                    `}
                  >
                    <div className="bg-white p-2 px-3 shadow-sm rounded-full flex items-center justify-center cursor-pointer">
                      <RadioGroup.Label
                        as="span"
                        className="whitespace-nowrap space-x-[4px] truncate text-center font-bold text-soft-blue w-min"
                      >
                        {Number(
                          formatBigNumberWithDecimals(
                            token.value,
                            getDecimals(
                              selectedToken.type === "Near"
                                ? 24
                                : selectedToken.metadata.decimals
                            )
                          )
                        ).toFixed(0)}{" "}
                        {selectedToken.type === "Near"
                          ? "Near"
                          : selectedToken.metadata.symbol}
                      </RadioGroup.Label>
                    </div>
                  </RadioGroup.Option>
                ))}
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

          {haveBalance && selectedAmount.value && (
            <div className="mt-16 mb-16">
              <div className="flex items-center justify-between">
                <span className="text-black text-[1.1rem] font-bold ">
                  Pool Anonymity
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                {depositScore < 500 ? (
                  <>
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className={`w-[77px] h-[9px] ${
                          item === 1 ? "bg-deep-blue" : "bg-gray-300"
                        } rounded-full`}
                      />
                    ))}
                  </>
                ) : depositScore >= 500 && depositScore < 1000 ? (
                  <>
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className={`w-[77px] h-[9px] ${
                          item === 1 && "bg-deep-blue"
                        } ${item === 2 && "bg-intermediate-score"} ${
                          item === 3 && "bg-gray-300"
                        }  rounded-full`}
                      />
                    ))}
                  </>
                ) : (
                  depositScore >= 1000 && (
                    <>
                      {[1, 2, 3].map((item) => (
                        <div
                          key={item}
                          className={`w-[77px] h-[9px] ${
                            item === 1 && "bg-deep-blue"
                          } ${item === 2 && "bg-intermediate-score"} ${
                            item === 3 && "bg-success"
                          }  rounded-full`}
                        />
                      ))}
                    </>
                  )
                )}
              </div>
              <p
                className="text-info font-normal text-sm underline flex items-center gap-2 mt-2 cursor-pointer"
                onClick={() => setShowModalPoolAnonymity(true)}
              >
                What is this <QuestionMarkCircleIcon className="w-4 h-4" />
              </p>
            </div>
          )}

          <p className="text-error ml-2 text-sm font-normal">{errorMessage}</p>
          <button
            disabled={depositing || !haveBalance}
            onClick={() => handleDeposit()}
            className="bg-soft-blue-from-deep-blue p-[12px] rounded-full mt-5 w-full font-[400] hover:opacity-[.9] disabled:opacity-[.6] disabled:cursor-not-allowed"
          >
            {!accountId ? "Connect Wallet" : buttonText}
          </button>

          {hashModal && (
            <HashModal
              isOpen={hashModal}
              onClose={() => {
                toggleHashModal();
              }}
            />
          )}
          {isOpen && (
            <FixedValuesModal
              isOpen={isOpen}
              onClose={() => setIsOpen(false)}
            />
          )}
        </div>
      </div>
      {showModalPoolAnonymity && (
        <WhatIsThisModal
          isOpen={showModalPoolAnonymity}
          onClose={() => setShowModalPoolAnonymity(false)}
        />
      )}
      {showAllowlistModal && (
        <WhitelistModal
          isOpen={showAllowlistModal}
          onClose={() => setAllowlistModal(false)}
        />
      )}
    </>
  );
}
