import ConfirmModal from "./confirm-modal";
import { useRelayer, useWithdraw } from "@/store";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { LoadingModal } from "@/components/modals/loading";
import { ToastCustom } from "@/components/toast-custom";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { WhatIsThisModal } from "@/components/modals/poolAnonymity";
import type { Logger } from "hideyourcash-sdk";
import { Button } from "@/components/button";
import { If } from "@/components/if";
import { RelayerFee } from "../relayer-fee";

const transactionHashes = new URLSearchParams(window.location.search).get(
  "transactionHashes"
);

const hycTransaction = "hyc-transaction";

let totalProgress = 40;

export function Withdraw() {
  const [progress, setProgress] = useState(40);
  const [showModal, setShowModal] = useState(false);
  const [showModalPoolAnonymity, setShowModalPoolAnonymity] = useState(false);
  const {
    // values
    note,
    ticket,
    buttonText,
    errorMessage,
    withdrawScore,
    generatingProof,
    recipientAddress,
    // methods
    handleNote,
    preWithdraw,
    cleanupInputs,
    poolWithdrawScore,
    handleRecipientAddress,
  } = useWithdraw();

  const {
    dynamicFee,
    loadingDynamicFee,
    recipientAddressError,
  } = useRelayer();

  const logger: Logger = {
    debug: (message: string) => {
      totalProgress = totalProgress + 0.37;

      setProgress(totalProgress);

      return message;
    },
  };

  if (transactionHashes) {
    localStorage.setItem(hycTransaction, JSON.stringify(true));
  }

  const handleWithdraw = async () => {
    try {
      await preWithdraw(logger);
      setShowModal(true);
    } catch (err) {
      console.warn(err);
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

  useEffect(() => {
    if (!ticket.contract) {
      return;
    }

    poolWithdrawScore();
  }, [ticket]);

  return (
    <>
      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleWithdraw();
          }}
        >
          <div className={`mb-5`}>
            <div className="flex items-center justify-between">
              <span className="text-black text-[1.1rem] font-bold">
                Withdrawal ticket
                {errorMessage && <span className="text-error"> * </span>}
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
                ${errorMessage ? "border-error" : "border-transparent"}
              `}
                  autoComplete="off"
                  value={note}
                  autoFocus
                  placeholder="Paste your withdraw ticked"
                  onChange={(e) => handleNote(e.target.value)}
                />
              </div>

              <p className="text-error mt-2 text-sm font-normal">
                {errorMessage && errorMessage}
              </p>
              {ticket.contract && !errorMessage && (
                <div className="my-5">
                  <div className="flex items-center justify-between">
                    <span className="text-black text-[1.1rem] font-bold ">
                      Transaction Anonymity
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {withdrawScore < 30 ? (
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
                    ) : withdrawScore >= 30 && withdrawScore < 60 ? (
                      <>
                        {[1, 2, 3].map((item) => (
                          <div
                            key={item}
                            className={`w-[77px] h-[9px] ${
                              item !== 3
                                ? "bg-intermediate-score"
                                : "bg-gray-300"
                            } rounded-full`}
                          />
                        ))}
                      </>
                    ) : (
                      withdrawScore >= 60 && (
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
                  placeholder="Wallet Address"
                  autoComplete="off"
                  value={recipientAddress}
                  onChange={(e) => handleRecipientAddress(e.target.value)}
                />
              </div>
              <p className="text-error mt-2 text-sm font-normal">
                {recipientAddressError && recipientAddressError}
              </p>
            </div>
          </div>

          {dynamicFee.token && !loadingDynamicFee && (
            <RelayerFee/>
          )}

          <If
            condition={!generatingProof}
            fallback={<LoadingModal loading={generatingProof} progress={progress} /> as any}
          >
            <div>
              <Button
                isLoading={loadingDynamicFee}
                onClick={() => handleWithdraw()}
                text={!showModal ? "Withdraw" : buttonText}
                disabled={!dynamicFee.token || loadingDynamicFee}
              />
            </div>
          </If>
        </form>
      </div>

      <ConfirmModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        cleanupInputsCallback={() => {
          cleanupInputs();
        }}
      />

      <WhatIsThisModal
        isOpen={showModalPoolAnonymity}
        onClose={() => setShowModalPoolAnonymity(false)}
      />
    </>
  );
}
