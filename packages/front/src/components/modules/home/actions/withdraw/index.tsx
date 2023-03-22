import ConfirmModal from "./confirm-modal";
import { useApp } from "@/store";
import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { LoadingModal } from "@/components/modals/loading";
import { getTicketInTheMerkleTree } from "@/utils/graphql-queries";
import { ToastCustom } from "@/components/shared/toast-custom";
import TotalDepositsModal from "@/components/modals/statistics/totalDeposits";
import TotalWithdrawsModal from "@/components/modals/statistics/totalWithdraws";
import { getCommitmentByTicket, viewWasNullifierSpent } from "hideyourcash-sdk";
import { useEnv } from "@/hooks/useEnv";
import { useWithdrawalScore } from "@/hooks/useWithdrawalScore";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { WhatIsThisModal } from "@/components/modals/poolAnonymity";
import Countdown from "react-countdown";
import type { Logger } from "hideyourcash-sdk";

function debounce (fn, time) {
  let timeoutId
  return wrapper
  function wrapper (...args) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      timeoutId = null
      fn(...args)
    }, time)
  }
}

const transactionHashes = new URLSearchParams(window.location.search).get(
  "transactionHashes"
);

const getHumanFormat = (value: number | string): string =>
  value < 10 ? `0${value}` : String(value);

let toRef;

const hycTransaction = "hyc-transaction";

let totalProgress = 40;

export function Withdraw() {
  const [showModal, setShowModal] = useState(false);
  const [showModalPoolAnonymity, setShowModalPoolAnonymity] = useState(false);
  const [generatingProof, setGeneratinProof] = useState(false);
  const [showModalDeposits, setShowModalDeposits] = useState(false);
  const [showModalWithdrawals, setShowModalWithdrawals] = useState(false);
  const buttonText = useRef("Withdraw");
  const [ticket, setTicket] = useState<any>();
  const [recipientAddress, setRecipientAddress] = useState("");
  const [dynamicFee, setDynamicFee] = useState<any>();
  const [loadingDynamicFee, setLoadingDynamicFee] = useState(false);
  const [recipientAddressError, setRecipientAddressError] = useState(false);
  const [progress, setProgress] = useState(40);
  const [ticketError, setTicketError] = useState('');
  const [note, setNote] = useState('');
  const [validatingNote, setValidatingNote] = useState(true);

  const logger: Logger = {
    debug: (message: string) => {
      totalProgress = totalProgress + 0.37;

      setProgress(totalProgress);

      return message;
    },
  };

  const {
    prepareWithdraw,
    relayerData,
    fetchRelayerData,
    getRelayerFee,
    setRelayerJWT,
  } = useApp();

  const validateNote = useCallback(debounce(async (value: string) => {
    console.log('validate note', value);

    setTicket({});
    setTicketError('');
    setValidatingNote(true);

    if (value === '') {
      setValidatingNote(false);

      return;
    }

    if (value.split('-').length < 4) {
      setValidatingNote(false);

      return setTicketError('Invalid withdraw ticket');
    }

    try {
      const isNullifierSpent = (await viewWasNullifierSpent(
        useEnv("VITE_NEAR_NODE_URL"),
        value,
      ));

      if (isNullifierSpent) {
        setValidatingNote(false);

        return setTicketError('Your ticket has been spent');
      }
    } catch(e) {
      setValidatingNote(false);

      console.warn(e);
    }

    const commitment = await getCommitmentByTicket(value);

    const ticketStored = await getTicketInTheMerkleTree(commitment);

    if (!ticketStored) {
      setValidatingNote(false);

      return setTicketError('This ticket has not been deposited yet');
    }

    setTicketError('');
    setTicket(ticketStored);
    setValidatingNote(false);

    return true;
  }, 500), []);

  const handleNote = (value) => {
    setNote(value);
    validateNote(value);
  };

  const handleRecipientAddress = (value) => {
    setRecipientAddress(value);
    setDynamicFee(null);

    if (!ticket?.contract || !value) {
      return;
    }

    checkRelayerFee(value, ticket?.contract);
  };

  const checkRelayerFee = useCallback(
    debounce(async (value, contract) => {
      if (!value || !relayerData || !contract) {
        return;
      }

      setLoadingDynamicFee(true);

      try {
        const { data } = await getRelayerFee(value, contract, relayerData);

        console.log(data);
        setDynamicFee(data);
        setRelayerJWT(data.token);
        setRecipientAddressError(false);
        createTimeout(data.valid_fee_for_ms, value, contract);
      } catch (e) {
        console.warn(e);
        setDynamicFee(null);
        setRecipientAddressError(true);

        if (toRef) {
          clearTimeout(toRef);
        }
      } finally {
        setLoadingDynamicFee(false);
      }
    }, 500),
    [relayerData]
  );

  const { withdrawalScore } = useWithdrawalScore(ticket ? ticket.value : "");

  if (transactionHashes) {
    localStorage.setItem(hycTransaction, JSON.stringify(true));
  }

  const preWithdraw = async () => {
    try {
      buttonText.current = "Preparing your withdraw...";
      clearTimeout(toRef);
      setGeneratinProof(true);
      await prepareWithdraw(
        ticket.contract,
        dynamicFee.price_token_fee,
        {
          note: note,
          recipient: recipientAddress,
        },
        logger
      );
      setGeneratinProof(false);
      setShowModal(true);
    } catch (err) {
      console.warn(err);
      setGeneratinProof(false);
      toast(
        <ToastCustom
          icon="/error-circle-icon.svg"
          title="Withdraw error"
          message="An error occured. It may be intermittent due to RPC cache, please try again in 10 minutes."
        />,
        {
          toastId: "error-toast",
        }
      );
    } finally {
      totalProgress = 40;
      setProgress(40);
    }
  };

  const createTimeout = (ms: number, accountId: string, contract: string) => {
    if (toRef) {
      clearTimeout(toRef);
    }

    toRef = setTimeout(() => {
      checkRelayerFee(accountId, contract);
    }, ms);
  };

  useEffect(() => {
    if (!relayerData) {
      fetchRelayerData();
    }
  }, [relayerData]);

  return (
    <>
      <div>
        <form onSubmit={(e) => {
          e.preventDefault();
          preWithdraw()
        }}>
          <div className={`mb-5`}>
            <div className="flex items-center justify-between">
              <span className="text-black text-[1.1rem] font-bold">
                Withdrawal ticket{" "}
                {ticketError && (
                  <span className="text-error"> * </span>
                )}
              </span>
            </div>
            <div>
              <div>
                <input
                  className={`
                mt-2
                p-[8px]
                h-[43px]
                bg-soft-blue-normal
                rounded-[15px]
                text-dark-grafiti-light
                w-full
                flex items-center justify-between
                border-[2px]
                focus:outline-none
                ${
                  ticketError ? "border-error" : "border-transparent"
                }
              `}
                  value={note}
                  onChange={(e) => handleNote(e.target.value)}
                  autoComplete="off"
                  placeholder="Paste your withdraw ticked"
                />
              </div>
              <p className="text-error mt-2 text-sm font-normal">
                {ticketError && ticketError}
              </p>
              {ticket && !ticketError && !validatingNote && (
                <div className="my-5">
                  <div className="flex items-center justify-between">
                    <span className="text-black text-[1.1rem] font-bold ">
                      Transaction Anonymity
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {withdrawalScore < 30 ? (
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
                    ) : withdrawalScore > 30 && withdrawalScore < 60 ? (
                      <>
                        {[1, 2, 3].map((item) => (
                          <div
                            key={item}
                            className={`w-[77px] h-[9px] ${
                              item !== 3 ? "bg-intermediate-score" : "bg-gray-300"
                            } rounded-full`}
                          />
                        ))}
                      </>
                    ) : (
                      withdrawalScore > 60 && (
                        <>
                          {[1, 2, 3].map((item) => (
                            <div
                              key={item}
                              className={`w-[77px] h-[9px] bg-success rounded-full`}
                            />
                          ))}
                        </>
                      )
                    )}
                  </div>
                  <p
                    className="text-info font-normal text-sm underline flex items-center gap-2 mt-2 cursor-pointer"
                    title="Coming soon"
                    onClick={() => setShowModalPoolAnonymity(true)}
                  >
                    What is this <QuestionMarkCircleIcon className="w-4 h-4" />
                  </p>
                </div>
              )}
            </div>
            <div className="mt-8 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-black text-[1.1rem] font-bold">
                  Recipient Address{" "}
                  {recipientAddressError && (
                    <span className="text-error"> * </span>
                  )}
                </span>
              </div>

              <div>
                <input
                  className={`
               mt-2
               p-[8px]
               h-[43px]
               bg-soft-blue-normal
               rounded-[15px]
               text-dark-grafiti-light
               w-full
               flex items-center justify-between
               border-[2px]
               focus:outline-none
               disabled:cursor-not-allowed
               ${recipientAddressError ? "border-error" : "border-transparent"}
             `}
                  disabled={!!!ticket?.contract}
                  placeholder="Wallet Address"
                  autoComplete="off"
                  value={recipientAddress}
                  onChange={(e) => handleRecipientAddress(e.target.value)}
                />
              </div>
              <p className="text-error mt-2 text-sm font-normal">
                {recipientAddressError && "Your recipient address is not valid"}
              </p>
            </div>
          </div>

          {dynamicFee && !loadingDynamicFee && (
            <div className="mt-[24px] mb-4">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <span className="text-black font-bold">Total</span>
                </div>

                <div className="text-black text-sm">
                  {(!generatingProof || showModal) && (
                    <Countdown
                      date={Date.now() + dynamicFee.valid_fee_for_ms}
                      key={dynamicFee.token}
                      renderer={({ hours, minutes, seconds }) => (
                        <span className="w-[65px] flex items-center">
                          {getHumanFormat(hours)}:{getHumanFormat(minutes)}:
                          {getHumanFormat(seconds)}
                        </span>
                      )}
                    />
                  )}
                </div>
              </div>

              <div className="flex flex-col w-full mt-2">
                <div className="flex items-center justify-between pb-[12px]">
                  <span className="text-black text-[14px]">Protocol fee:</span>

                  <span className="text-black font-bold">
                    {dynamicFee.human_network_fee}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-[12px]">
                  <span className="text-black text-[14px]">Relayer fee:</span>

                  <span className="text-black font-bold">
                    {dynamicFee.formatted_token_fee}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <span className="text-black text-[14px]">
                    Total to receive:
                  </span>

                  <span className="text-black font-bold">
                    {dynamicFee.formatted_user_will_receive}
                  </span>
                </div>
              </div>
            </div>
          )}

          {generatingProof ? (
            <LoadingModal loading={generatingProof} progress={progress} />
          ) : (
            <div>
              <button
                type="submit"
                disabled={!dynamicFee || loadingDynamicFee}
                className="bg-soft-blue-from-deep-blue mt-[12px] p-[12px] rounded-full w-full font-[400] hover:opacity-[.9] disabled:opacity-[.6] disabled:cursor-not-allowed"
              >
                {loadingDynamicFee && (
                  <>
                    <div className="flex items-center justify-center w-full my-auto text-black">
                      <svg
                        className="animate-spin h-6 w-6 border border-l-current rounded-full"
                        viewBox="0 0 24 24"
                      />
                    </div>
                  </>
                )}

                {!loadingDynamicFee && (
                  <>
                    {" "}
                    {!showModal ? "Withdraw" : buttonText.current}{" "}
                  </>
                )}
              </button>
            </div>
          )}
          <ConfirmModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            cleanupInputsCallback={() => {
              setTicket('');
              setDynamicFee(null);
              setRecipientAddress('');
              setRecipientAddressError(false);
            }}
          />
        </form>
      </div>
      <WhatIsThisModal
        isOpen={showModalPoolAnonymity}
        onClose={() => setShowModalPoolAnonymity(false)}
      />
      <TotalDepositsModal
        isOpen={showModalDeposits}
        onClose={() => setShowModalDeposits(false)}
      />
      <TotalWithdrawsModal
        isOpen={showModalWithdrawals}
        onClose={() => setShowModalWithdrawals(false)}
      />
    </>
  );
}
