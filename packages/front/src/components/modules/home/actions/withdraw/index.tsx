import ConfirmModal from "./confirm-modal";
import { useApplication } from "@/store";
import React, { useState, useMemo, useEffect, SetStateAction } from "react";
import { useWalletSelector } from "@/utils/context/wallet";
import toast from "react-hot-toast";
import { useNullfierCheck } from "@/hooks/useNullifierCheck";

export function Withdraw({
  setChangingTab
}: {
  setChangingTab: React.Dispatch<SetStateAction<boolean>>;
}) {
  setChangingTab(true);
  const [hash, setHash] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [hashData, setHashData] = useState<any>();
  const [fechtingData, setFechtingData] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [buttonText, setButtonText] = useState("Withdraw");
  const [errorMessage, setErrorMessage] = useState<{
    errorHash?: string;
    errorRepicient?: string;
    nullifierValid?: string;
  }>();

  const handleMoreInfos = false;

  const {
    hash: withdrawHash,
    fetchHashData,
    prepareWithdraw
  } = useApplication();

  const { selector, accountId, toggleModal } = useWalletSelector();
  const { nullifierValid } = useNullfierCheck(hash, selector);

  const preWithdraw = async () => {
    if (!accountId) {
      toggleModal();

      return;
    }
    if (!hash || !withdrawAddress) {
      setErrorMessage({
        errorHash: "Invalid withdraw ticket",
        errorRepicient: "Invalid address"
      });
      return;
    }

    // if (!nullifierValid) {
    //   setErrorMessage({ nullifierValid: "This hash is not valid anymore" });
    //   return;
    // }

    setButtonText("Preparing your withdraw...");

    try {
      await prepareWithdraw(selector, {
        note: hash,
        recipient: withdrawAddress
      });
      setShowModal(true);
    } catch (err) {
      console.warn(err);
      toast.error(
        "An error occured. It may be intermittent due to RPC cache, please try again in 10 minutes.",
        {
          duration: 10000
        }
      );
    }
  };

  const hasErrorHash = useMemo(() => {
    return !hash;
  }, [hash]);

  const handleHash = (value: string) => {
    if (value === hash) {
      return;
    }

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
        <div className={`${handleMoreInfos ? "mb-2" : "mb-[76px]"}`}>
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
                ${
                  errorMessage?.errorHash && hash.length === 0
                    ? "border-error"
                    : "border-transparent"
                }
              `}
              value={hash}
              onInput={ev => handleHash((ev.target as HTMLInputElement).value)}
              placeholder="Paste your withdar ticked"
            />
          </div>
          <p className="text-error mt-2 text-sm font-normal">
            {errorMessage?.errorHash && hash.length === 0
              ? errorMessage.errorHash
              : errorMessage?.nullifierValid && errorMessage.nullifierValid}
          </p>
        </div>
        {handleMoreInfos && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-black text-sm font-normal">Amount</p>
              <p className="text-black font-bold text-sm">1 NEAR</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-black text-sm font-normal">Time passes</p>
              <p className="text-black font-bold text-sm">10 minutes</p>
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
               ${
                 errorMessage?.errorRepicient && withdrawAddress.length === 0
                   ? "border-error"
                   : "border-transparent"
               }
             `}
              placeholder="Wallet Address"
              value={withdrawAddress}
              onInput={ev =>
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

                <span className="text-black font-bold">{`${hashData?.amount /
                  1 -
                  hashData?.relayer_fee} NEAR`}</span>
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
      </div>
    </div>
  );
}
