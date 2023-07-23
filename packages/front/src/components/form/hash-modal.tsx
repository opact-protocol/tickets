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
import useDeposit from "@/hooks/deposit";

export default function Modal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [buttonText, setButtonText] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const {
    state,

    dispatch,
    sendDeposit,

  } = useDeposit();

  const closeModal = () => {
    if (state.sendingDeposit) {
      return;
    }

    onClose();
  };

  const handleDeposit = async () => {
    if (!state.copyTicket) {
      setErrorMessage("Copy or download your withdraw ticket to continue");
      return;
    }
    setButtonText("Sending your Deposit...");
    await sendDeposit();
    closeModal();
    setButtonText(`Deposit ${state.selectedAmount!.value} Near`);
  };

  useEffect(() => {
    if (!isOpen) return;
    const blob = new Blob([state.note], { type: "text/plain;charset=utf-8" });

    const formatedNumber = Number(
      formatBigNumberWithDecimals(
        state.selectedAmount!.value,
        getDecimals(
          state.selectedToken.type === "Near" ? 24 : state.selectedToken.metadata.decimals
        )
      )
    ).toFixed(0);

    FileSaver.saveAs(blob, `opact-${formatedNumber}-${state.selectedToken.type}.txt`);
  }, [isOpen, state.selectedAmount]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-[999]"
        onClose={() => {
          closeModal();
          dispatch({ copyTicket: false });
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
                      : state.copyTicket
                      ? "border-success"
                      : ""
                  }`}
                >
                  <p
                    className={`${
                      state.copyTicket ? "text-success" : "text-white"
                    } truncate text-[16px] font-[500] leading-[24px] opacity-[0.89] p-[16px]`}
                  >
                    {state.note}
                  </p>

                  <CopyToClipboard
                    text={state.note}
                    onCopy={() => {
                      dispatch({ copyTicket: true })
                      setErrorMessage("");
                    }}
                  >
                    <button
                      className={`min-w-[20px] min-h-[20px] flex items-center gap-3 pr-10 ${
                        state.copyTicket ? "text-success" : "text-dark-grafiti-medium"
                      } text-sm font-normal`}
                    >
                      <img
                        src={state.copyTicket ? "/copied-icon.svg" : "/copy-icon.svg"}
                        alt={state.copyTicket ? "Copied Icon" : "Copy Icon"}
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
                  text={handleButtonText(buttonText)}
                />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
