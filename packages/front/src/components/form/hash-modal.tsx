import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import DownloadLink from "react-download-link";
import FileSaver from "file-saver";
import { Button } from "../button";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

import {
  formatBigNumberWithDecimals,
  getDecimals,
} from "hideyourcash-sdk";
import { useWallet } from "@/store";

export default function Modal({
  hash,
  token,
  amount,
  isOpen,
  onClose,
  onClick,
}: {
  token: any;
  amount: any;
  hash: string;
  isOpen: boolean;
  onClose: () => void;
  onClick: () => void;
}) {
  const [sending, setSending] = useState(false)
  const [buttonText, setButtonText] = useState<string>("Deposit");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [copyTicket, setCopyTicket] = useState<boolean>(false);

  const {
    accountId,
    selector
  } = useWallet()

  const closeModal = () => {
    if (sending) {
      return;
    }

    onClose();
  };

  const handleDeposit = async () => {
    if (!selector || !accountId) {
      return
    }

    if (!copyTicket) {
      setErrorMessage("Copy or download your withdraw ticket to continue");

      return;
    }

    setButtonText("Sending your Deposit...");

    await onClick()

    closeModal();

    setButtonText(`Deposit ${amount.value} Near`);
  };

  useEffect(() => {
    if (!isOpen || !amount) return;

    const blob = new Blob([hash], { type: "text/plain;charset=utf-8" });

    const formatedNumber = Number(
      formatBigNumberWithDecimals(
        amount.value,
        getDecimals(
          token.type === "Near" ? 24 : token.metadata.decimals
        )
      )
    ).toFixed(0);

    FileSaver.saveAs(blob, `opact-${formatedNumber}-${token.type.toLowerCase()}.txt`);
  }, [isOpen, amount]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-[999]"
        onClose={() => {
          closeModal();
          setSending(false);
          setCopyTicket(false);
        }}
      >
        <div className="fixed inset-0 overflow-y-auto modal-bg">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-[654px] transform overflow-hidden rounded-[8px] border-[1px] border-[#606466] bg-form-gradient p-[24px] transition-all text-left">
                <Dialog.Title
                  as="h1"
                  className="text-white font-title text-[18px] font-[500]"
                >
                  Withdrawal ticket
                </Dialog.Title>

                <p
                  className="
                    py-[16px]
                    text-[15px]
                    leading-[19.5px]
                    font-[500]
                    text-[#BDBDBD] w-full
                  "
                >
                  The number below is your withdrawal ticket, and it will be
                  necessary to withdraw the funds you’ve deposited. The ticket
                  is downloaded automatically to ensure that you do not forget
                  to manually copy or download. We also encourage you to copy
                  this number and paste it in a notepad or somewhere else safe.
                </p>

                <div
                  className="bg-[#FED7D7] text-[#C12E2A] rounded-[4px] gap-[8px] flex p-[8px]"
                >
                  <ExclamationTriangleIcon
                    className="w-[18px]"
                  />
                  <span className="text-[14px] font-[700]">
                    If you lose this ticket you’ll lose your funds
                  </span>
                </div>

                <p className="text-error text-sm font-normal text-center mt-[19px]">
                  {errorMessage}
                </p>

                <div
                  className={`flex items-center bg-transparent border-[1px] border-[#606466] rounded-[8px] w-full ${
                    errorMessage
                      ? "border-error mt-0"
                      : copyTicket
                      ? "border-success"
                      : ""
                  }`}
                >
                  <p
                    className={`${
                      copyTicket ? "text-success" : "text-white"
                    } truncate text-[16px] font-[500] leading-[24px] opacity-[0.89] p-[16px]`}
                  >
                    {hash}
                  </p>

                  <CopyToClipboard
                    text={hash}
                    onCopy={() => {
                      setCopyTicket(true)
                      setErrorMessage("");
                    }}
                  >
                    <button
                      className={`min-w-[20px] min-h-[20px] flex items-center gap-3 pr-10 ${
                        copyTicket ? "text-success" : "text-dark-grafiti-medium"
                      } text-sm font-normal`}
                    >
                      <img
                        src={copyTicket ? "/copied-icon.svg" : "/copy-icon.svg"}
                        alt={copyTicket ? "Copied Icon" : "Copy Icon"}
                        className="min-w-[20px] min-h-[20px]"
                      />
                    </button>
                  </CopyToClipboard>
                </div>

                <div
                  className="
                    pt-[24px]
                    pb-[40px]
                  "
                >
                  <p
                    className="
                      text-white
                      text-[15px] leading-[19.5px] font-[500] opacity-[0.89]
                    "
                  >
                    To ensure the anonymity of your transaction, we recommend you
                    wait <strong>at least 30 minutes</strong> to withdraw the
                    funds deposited.{" "}
                  </p>
                </div>

                <Button
                  disabled={false}
                  isLoading={false}
                  onClick={() => handleDeposit()}
                  text={buttonText}
                />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
