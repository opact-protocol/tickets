import HashModal from "./hash-modal";
import { Fragment, useCallback, useState } from "react";
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
import { useDeposit } from "@/hooks/deposit";
import { TicketScore } from "../ticket-score";
import { getDecimals, formatBigNumberWithDecimals } from "hideyourcash-sdk";
import { Button } from "../button";
import { twMerge } from "tailwind-merge";
import { formatAmounts } from "@/utils/number";

const transactionHashes = new URLSearchParams(window.location.search).get(
  "transactionHashes"
);

const hycTransaction = "hyc-transaction";

const customId = "deposit-toast";

export function Deposit() {
  const [showModalPoolAnonymity, setShowModalPoolAnonymity] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [haveBalance, setHaveBalance] = useState(true);
  const { accountId, selector, toggleModal, allCurrencies, nearBalance, tokenBalance } = useWallet();

  const {
    state,

    makeHash,
    dispatch,
    sendDeposit,
  } = useDeposit();

  const amounts = formatAmounts(state.selectedToken ? state.selectedToken.contracts : "");
  const approved = localStorage.getItem(hycTransaction);
  const { action } = useAction(transactionHashes!, accountId!);

  if (!action && transactionHashes && !approved) {
    toast(
      <ToastCustom
        variant="info"
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
          title={title}
          message={message}
          variant={action?.status as any}
        />
      ),
    });
  }

  const handleDeposit = async () => {
    if (!accountId) {
      toggleModal();

      return;
    }

    await makeHash({ accountId, haveBalance });
  };

  const send = useCallback(async () => {
    if (!selector) {
      return
    }

    console.log(accountId, selector, state)

    return sendDeposit({
      accountId,
      // @ts-ignore
      connection: selector,
    })
  }, [selector, accountId, state])

  return (
    <>
      <div>
        <div>
          <div>
            <div className="flex items-center justify-between">
              <span className="font-title font-[500] text-[18px]">
                Choose token{" "}
                <span className="text-error">
                  {state.errorMessage.includes("token") && "*"}
                </span>
              </span>
            </div>

            <Listbox
              disabled={!accountId}
              key={state.selectedToken}
              value={state.selectedToken}
              onChange={(payload) => dispatch({ selectedToken: payload, selectedAmount: null, haveBalance: true })}
            >
              <div className="relative mt-[16px]">
                <Listbox.Button
                  className={twMerge("border-[#606466] cursor-pointer relative w-full rounded-[8px] py-[18px] px-[16px] text-left border-[1px]", !accountId && 'cursor-not-allowed')}
                >
                  <span className="flex gap-2 items-center truncate text-white opacity-[0.9] text-[16px] font-[500]">
                    {state.selectedToken && state.selectedToken.type === "Near" && (
                      <>
                        <img
                          src={
                            state.selectedToken.type === "Near"
                              ? state.selectedToken.icon
                              : state.selectedToken.metadata.icon!
                          }
                          alt={
                            state.selectedToken.type === "Near"
                              ? "Near"
                              : state.selectedToken.metadata.name!
                          }
                          className="w-5 rounded-full"
                        />
                        {state.selectedToken.type === "Near"
                          ? state.selectedToken.type
                          : state.selectedToken.metadata.name!}
                      </>
                    )}

                    {state.selectedToken && state.selectedToken.metadata && (
                      <>
                        <img
                          src={
                            state.selectedToken.type === "Near"
                              ? state.selectedToken.icon
                              : state.selectedToken.metadata.icon!
                          }
                          alt={
                            state.selectedToken.type === "Near"
                              ? "Near"
                              : state.selectedToken.metadata.name!
                          }
                          className="w-5 rounded-full"
                        />
                        {state.selectedToken.type === "Near"
                          ? state.selectedToken.type
                          : state.selectedToken.metadata.name!}
                      </>
                    )}

                    {(!state.selectedToken || !state.selectedToken.type) && "Select token"}
                  </span>

                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-[16px]">
                    <ChevronDownIcon
                      className="h-5 w-5 text-white font-bold"
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
                  <Listbox.Options className="absolute mt-1 w-full max-h-60 overflow-auto rounded-[8px] bg-form-gradient border-[#606466] border-[1px] outline-none z-[10] p-[16px]">
                    {allCurrencies?.map((token, i) => (
                      <Listbox.Option
                        key={token.type}
                        className={({ active }) =>
                          "relative cursor-pointer select-none mx-auto w-full"
                        }
                        value={token}
                      >
                        <div
                          className="flex space-x-[12px]"
                        >
                          <div>
                            <img
                                src={
                                  token.type === "Near"
                                    ? token.icon
                                    : token.metadata.icon!
                                }
                                alt=""
                                className="w-[24px] h-[24px] rounded-full"
                                loading="lazy"
                              />
                          </div>

                          <span
                            className="flex gap-2 truncate text-white font-title text-[16px] font-[500] opacity-[0.9]"
                          >
                            {token.type === "Near"
                              ? token.type
                              : token.metadata.name!}
                          </span>

                        </div>

                        {i % 2 === 0 &&
                          <div
                            className="py-[16px] flex items-center justify-center"
                          >
                            <div
                              className="w-full h-[1px] bg-[#5B5F61]"
                            />
                          </div>
                        }
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>
          </div>

          {state.selectedToken ? (
            <div className="mt-[24px]">
              <div className="flex flex-row items-center w-full">
                <div
                  className="flex items-center grow space-x-[10px]"
                >
                  <span className="text-white font-title text-[18px] font-[500]">
                    Amount{" "}
                    <span className="text-error">{state.errorMessage && "*"}</span>
                  </span>

                  <p
                    className="flex items-center cursor-pointer"
                    onClick={() => setIsOpen(true)}
                  >
                    <QuestionMarkCircleIcon className="w-4 h-4 text-[#606466]" />
                  </p>
                </div>

                {!haveBalance && (
                  <span className="flex text-error mt-[1px] text-sm font-normal">
                    {"Your account doesn't have enough balance"}
                  </span>
                )}
              </div>

              <RadioGroup
                value={state.selectedAmount}
                onChange={(payload) => {
                  if (state.selectedToken.type === "Near") {
                    setHaveBalance(() => nearBalance > +payload.value);
                  } else {
                    setHaveBalance(() => tokenBalance > +payload.value);
                  }

                  dispatch({ selectedAmount: payload })
                }}
                className="mt-[16px] max-w-full flex gap-[16px]"
                as="ul"
              >
                {amounts?.map((token) => (
                  <RadioGroup.Option
                    key={token.accountId}
                    value={token}
                    as="li"
                    className={() => `
                      px-[26px] py-[10px]
                      hover:bg-[#606466] hover:bg-none border border-[#606466] w-max rounded-full p-1 cursor-pointer ${
                        state.selectedAmount?.accountId === token.accountId
                          ? "bg-[#606466]"
                          : "bg-form-gradient"
                      }
                    `}
                  >
                    <RadioGroup.Label
                      as="span"
                      className="whitespace-nowrap space-x-[4px] truncate text-center text-[16px] font-[500] font-title leading-[20px] text-white w-min"
                    >
                      {Number(
                        formatBigNumberWithDecimals(
                          token.value,
                          getDecimals(
                            state.selectedToken.type === "Near"
                              ? 24
                              : state.selectedToken.metadata.decimals
                          )
                        )
                      ).toFixed(0)}{" "}
                      {state.selectedToken.type === "Near"
                        ? "Near"
                        : state.selectedToken.metadata.symbol}
                    </RadioGroup.Label>
                  </RadioGroup.Option>
                ))}
              </RadioGroup>
            </div>
          ) : null}

          {haveBalance && state.selectedAmount && (
            <TicketScore score={100} />
          )}

          <p className="text-error ml-2 text-sm font-normal">{state.errorMessage}</p>

          <div
            className="pt-[32px]"
          >
            <Button
              isLoading={false}
              disabled={state.depositing || !haveBalance}
              onClick={() => handleDeposit()}
              text={!accountId ? "Connect Wallet" : state.buttonText}
            />
          </div>

          <HashModal
            hash={state.note}
            token={state.selectedToken}
            amount={state.selectedAmount}
            isOpen={state.showHashModal}
            onClose={() => {
              dispatch({ showHashModal: false })
            }}
            onClick={async () => send()}
          />

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
      {state.showAllowlistModal && (
        <WhitelistModal
          isOpen={state.showAllowlistModal}
          onClose={() => dispatch({ setAllowlistModal: false })}
        />
      )}
    </>
  );
}
