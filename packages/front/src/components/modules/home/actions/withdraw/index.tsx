import ConfirmModal from "./confirm-modal";
import { useApplication } from "@/store";
import { Disclosure } from "@headlessui/react";
import { useState, useMemo, useEffect } from "react";
import { useNearWalletSelector } from "@/utils/context/wallet";
import {
  ExclamationCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";

export function Withdraw() {
  const [hash, setHash] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [hashData, setHashData] = useState<any>();
  const [fechtingData, setFechtingData] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [buttonText, setButtonText] = useState("Withdraw");

  const {
    hash: withdrawHash,
    fetchHashData,
    prepareWithdraw,
  } = useApplication();

  const { connection, accountId, toggleModal } = useNearWalletSelector();

  const preWithdraw = async () => {
    if (!accountId) {
      toggleModal();

      return;
    }

    setButtonText("Preparing your withdraw...");

    try {
      await prepareWithdraw(connection, {
        note: hash,
        recipient: withdrawAddress,
      });

      setShowModal(true);
    } catch (err) {
      console.warn(err);
    }
  };

  const hasErrorHash = useMemo(() => {
    return !hash;
  }, [hash]);

  const handleHash = (value) => {
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
    <div className="w-[500px] bg-white rounded-2xl border border-gray-200 px-9 py-8 mx-auto">
      <div className="mb-[28px]">
        <span className="text-[18px] leading-6 text-gray-900 font-[500]">
          Withdraw
        </span>
      </div>

      <div>
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[#121315] text-[1.1rem] font-[500]">
              Hash of deposit
            </span>
          </div>

          <div>
            <input
              className="
                mt-2
                p-[8px]
                h-[43px]
                bg-[#f7f8fa]
                rounded-full
                text-[#121315]
                opacity-[.8]
                w-full
                px-[24px]
                flex items-center justify-between
              "
              value={hash}
              onInput={(ev) =>
                handleHash((ev.target as HTMLInputElement).value)
              }
              placeholder="Deposit Hash"
            />
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between">
            <span className="text-[#121315] text-[1.1rem] font-[500]">
              Recipient Address
            </span>
          </div>

          <div>
            <input
              className="
                mt-2
                p-[8px]
                h-[43px]
                bg-[#f7f8fa]
                rounded-full
                text-[#121315]
                opacity-[.8]
                w-full
                px-[24px]
                flex items-center justify-between
                disabled:cursor-not-allowed
              "
              disabled={hasErrorHash}
              placeholder="Wallet Address"
              value={withdrawAddress}
              onInput={(ev) =>
                setWithdrawAddress((ev.target as HTMLInputElement).value)
              }
            />
          </div>
        </div>

        {false && (
          <div className="mt-[24px]">
            <Disclosure>
              {({ open }) => (
                <>
                  <Disclosure.Button className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-[4px]">
                      <ExclamationCircleIcon className="text-[#a1a1a8] w-[20px]" />

                      <span className="text-[#121315] text-[14px]">
                        More Info to withdraw
                      </span>
                    </div>

                    {open ? (
                      <ChevronDownIcon className="text-[#a1a1a8] w-[20px]" />
                    ) : (
                      <ChevronUpIcon className="text-[#a1a1a8] w-[20px]" />
                    )}
                  </Disclosure.Button>

                  <Disclosure.Panel className="pt-[24px]">
                    <div className="flex flex-col p-[20px] border border-[#e0e1e4] rounded-[16px] space-y-[12px] w-full">
                      <div className="flex items-center justify-between pb-[12px] border-b-[1px] border-[#e0e1e4]">
                        <span className="text-[#8d8d94] text-[14px]">
                          Amount:
                        </span>

                        <span
                          className="text-[#121315]"
                          children={hashData?.amount + "NEAR"}
                        />
                      </div>

                      <div className="flex items-center justify-between pb-[12px] border-b-[1px] border-[#e0e1e4]">
                        <span className="text-[#8d8d94] text-[14px]">
                          Relayer fee:
                        </span>

                        <span
                          className="text-[#121315]"
                          children={`${hashData?.relayer_fee * 100}%`}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[#8d8d94] text-[14px]">
                          Tokens to receive:
                        </span>

                        <span
                          className="text-[#121315]"
                          children={`${
                            hashData?.amount / 1 - hashData?.relayer_fee
                          }NEAR`}
                        />
                      </div>
                    </div>
                  </Disclosure.Panel>
                </>
              )}
            </Disclosure>
          </div>
        )}

        <div>
          <button
            disabled={hasErrorHash && !!accountId}
            onClick={() => preWithdraw()}
            children={!accountId ? "Connect Wallet" : buttonText}
            className="bg-[#121315] mt-[24px] p-[12px] rounded-full w-full font-[400] hover:opacity-[.9] disabled:opacity-[.6] disabled:cursor-not-allowed"
          />
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
