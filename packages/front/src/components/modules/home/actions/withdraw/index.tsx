import ConfirmModal from "./confirm-modal";
import { useApplication } from "@/store";
import React, { useState, useMemo, useEffect, SetStateAction } from "react";
import { useWalletSelector } from "@/utils/context/wallet";
import toast from "react-hot-toast";
import { useNullfierCheck } from "@/hooks/useNullifierCheck";
import { LoadingModal } from "@/components/modals/loading";
import {
  getLastWithdrawBeforeTheTicketWasCreated,
  getTicketInTheMerkleTree,
  GET_CURRENT_GRAETEST_COUNTER,
  GET_MOST_RECENT_WITHDRAW,
} from "@/utils/graphql-queries";
import { generateCommitment } from "@/utils/generate-commitment";
import { ToastCustom } from "@/components/shared/toast-custom";
import { useQuery } from "@apollo/client";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function Withdraw({
  setChangeTab,
}: {
  setChangeTab: React.Dispatch<SetStateAction<boolean>>;
}) {
  setChangeTab(true);
  const { data } = useQuery(GET_CURRENT_GRAETEST_COUNTER);
  const { data: recentWithdraw } = useQuery(GET_MOST_RECENT_WITHDRAW);
  const [hash, setHash] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [hashData, setHashData] = useState<any>();
  const [fechtingData, setFechtingData] = useState(false);
  const [generatingProof, setGeneratingProof] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [buttonText, setButtonText] = useState("Withdraw");
  const [errorMessage, setErrorMessage] = useState<{
    errorHash?: string;
    errorRepicient?: string;
    nullifierValid?: string;
    ticketStored?: string;
  }>();
  const [statistics, setStatistics] = useState<{
    totalDeposits: number;
    totalWithdraws: number;
  }>({} as { totalDeposits: number; totalWithdraws: number });

  const handleMoreInfos = false;

  const {
    hash: withdrawHash,
    fetchHashData,
    prepareWithdraw,
  } = useApplication();

  const { selector, accountId, toggleModal } = useWalletSelector();
  const { nullifierInvalid } = useNullfierCheck(hash, selector);

  if (nullifierInvalid) {
    setErrorMessage({ nullifierValid: "This hash is not valid anymore" });
  }

  const preWithdraw = async () => {
    if (!accountId) {
      toggleModal();

      return;
    }
    if (!hash || !withdrawAddress) {
      setErrorMessage({
        errorHash: "Invalid withdraw ticket",
        errorRepicient: "Invalid address",
      });
      return;
    }

    try {
      setButtonText("Preparing your withdraw...");
      setGeneratingProof(true);
      await prepareWithdraw(selector, {
        note: hash,
        recipient: withdrawAddress,
      });
      setGeneratingProof(false);
      setShowModal(true);
    } catch (err) {
      console.warn(err);
      toast.custom(
        (t) => (
          <ToastCustom
            icon="/error-circle-icon.svg"
            id={t.id}
            visible={t.visible}
            key={t.id}
          />
        ),
        { duration: 10000 }
      );
    }
  };

  console.log(errorMessage);

  const hasErrorHash = useMemo(() => {
    return !hash;
  }, [hash]);

  const handleHash = async (value: string) => {
    if (!value) setErrorMessage(undefined);

    if (value === hash) {
      return;
    }
    if (value.length < 220) {
      setErrorMessage({ ticketStored: "This ticket is invalid" });
      return;
    }
    const commitment = generateCommitment(value);

    const ticketStored = await getTicketInTheMerkleTree(commitment!);

    if (!ticketStored) {
      setErrorMessage({
        ticketStored: "This ticket has not been deposited yet",
      });
      return;
    }

    const lastWithdraw = await getLastWithdrawBeforeTheTicketWasCreated(
      ticketStored.timestamp
    );

    const totalDeposits =
      +data.depositMerkleTreeUpdates[0].counter - +ticketStored.counter;

    const totalWithdraws =
      +recentWithdraw.withdrawals[0].counter - +lastWithdraw.counter;

    setStatistics({ totalDeposits, totalWithdraws });

    setHash(value);
  };

  useEffect(() => {
    if (hasErrorHash) {
      setHashData(null);

      return;
    }

    (async () => {
      setFechtingData(true);

      const hashData = await fetchHashData();

      setHashData(hashData);
      setFechtingData(false);
    })();
  }, [hasErrorHash]);

  return (
    <div>
      <div>
        <div className={`mb-5`}>
          <div className="flex items-center justify-between">
            <span className="text-black text-[1.1rem] font-bold">
              Withdraw ticket{" "}
              {errorMessage?.errorHash && hash.length === 0 && (
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
                ${
                  (errorMessage?.errorHash && hash.length === 0) ||
                  errorMessage?.errorRepicient ||
                  errorMessage?.nullifierValid ||
                  errorMessage?.ticketStored
                    ? "border-error"
                    : "border-transparent"
                }
              `}
              onInput={(ev) =>
                handleHash((ev.target as HTMLInputElement).value)
              }
              placeholder="Paste your withdraw ticked"
            />
          </div>
          <p className="text-error mt-2 text-sm font-normal">
            {errorMessage?.errorHash && hash.length === 0
              ? errorMessage.errorHash
              : errorMessage?.nullifierValid
              ? errorMessage.nullifierValid
              : errorMessage?.ticketStored && errorMessage.ticketStored}
          </p>
        </div>
        {statistics.totalDeposits && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-black text-sm font-normal">
                Total deposits to date
              </p>
              <p className="text-black font-bold text-sm">
                {statistics.totalDeposits}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-black text-sm font-normal">
                Total withdraws to date
              </p>
              <p className="text-black font-bold text-sm">
                {statistics.totalWithdraws}
              </p>
            </div>
          </div>
        )}

        <div className={`mt-8 ${handleMoreInfos ? "mb-6" : "mb-44"}`}>
          <div className="flex items-center justify-between">
            <span className="text-black text-[1.1rem] font-bold">
              Recipient Address{" "}
              {errorMessage?.errorRepicient && withdrawAddress.length === 0 && (
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
               ${
                 errorMessage?.errorRepicient && withdrawAddress.length === 0
                   ? "border-error"
                   : "border-transparent"
               }
             `}
              placeholder="Wallet Address"
              value={withdrawAddress}
              onInput={(ev) =>
                setWithdrawAddress((ev.target as HTMLInputElement).value)
              }
            />
          </div>
          <p className="text-error mt-2 text-sm font-normal">
            {errorMessage?.errorRepicient &&
              withdrawAddress.length === 0 &&
              errorMessage.errorRepicient}
          </p>
        </div>

        {handleMoreInfos && (
          <div className="mt-[24px]">
            <div>
              <span className="text-black font-bold">Total</span>
            </div>

            <div className="flex flex-col w-full mt-2">
              <div className="flex items-center justify-between pb-[12px]">
                <span className="text-black text-[14px]">Network fee</span>

                <span className="text-black font-bold">{`${hashData?.amount} NEAR`}</span>
              </div>

              <div className="flex items-center justify-between pb-[12px]">
                <span className="text-black text-[14px]">Relayer fee:</span>

                <span className="text-black font-bold">{`${hashData?.relayer_fee} NEAR`}</span>
              </div>
              <div className="flex items-center justify-between pb-[12px]">
                <span className="text-black text-[14px]">Total fee:</span>

                <span className="text-black font-bold">{`0,200 NEAR`}</span>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-black text-[14px]">
                  Tokens to receive:
                </span>

                <span className="text-black font-bold">{`${
                  hashData?.amount / 1 - hashData?.relayer_fee
                } NEAR`}</span>
              </div>
            </div>
          </div>
        )}

        <div>
          <button
            onClick={() => preWithdraw()}
            className="bg-soft-blue-from-deep-blue mt-[15px] p-[12px] rounded-full w-full font-[400] hover:opacity-[.9] disabled:opacity-[.6] disabled:cursor-not-allowed"
          >
            {" "}
            {!accountId ? "Connect Wallet" : buttonText}{" "}
          </button>
        </div>

        <ConfirmModal
          isOpen={showModal}
          onClose={() => {
            setHash("");
            setWithdrawAddress("");
            setShowModal(!showModal);
            setButtonText("Withdraw");
          }}
        />
        <LoadingModal
          isOpen={generatingProof}
          onClose={() => setGeneratingProof(false)}
        />
      </div>
    </div>
  );
}
