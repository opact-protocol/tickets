import { useApplication } from "@/store";
import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import DownloadLink from "react-download-link";
import { useWallet } from "@/store/wallet";
import {
  Currency,
  formatBigNumberWithDecimals,
  getDecimals,
  ViewCurrenciesResponseInterface,
} from "hideyourcash-sdk";

export default function Modal({
  isOpen,
  onClose,
  amount,
  contract,
  currency,
  token,
}: {
  isOpen: boolean;
  amount: string;
  contract: string;
  token: ViewCurrenciesResponseInterface;
  currency: Currency;
  onClose: () => void;
}) {
  const [sending, setSending] = useState(false);
  const [buttonText, setButtonText] = useState<string>("");
  const [copy, setCopy] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { selector, accountId } = useWallet();
  const { note, sendDeposit } = useApplication();

  const closeModal = () => {
    if (sending) {
      return;
    }

    onClose();
  };

  const deposit = async () => {
    if (!copy) {
      setErrorMessage("Copy or download your withdraw ticket to continue");
      return;
    }

    setSending(true);
    setButtonText("Sending your Deposit...");

    try {
      await sendDeposit(amount, contract, accountId!, currency, selector!);

      closeModal();
      setSending(false);
      setButtonText(`Deposit ${amount} Near`);
      setCopy(false);
    } catch (e) {
      console.warn(e);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const blob = new Blob([note], { type: "text/plain;charset=utf-8" });
    FileSaver.saveAs(blob, "ticket.txt");
  }, [isOpen]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-[999]"
        onClose={() => {
          closeModal();
          setCopy(false);
        }}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
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
              <Dialog.Panel className="w-full max-w-[873px] transform overflow-hidden rounded-[35px] bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h1"
                  className="text-black text-xl font-bold font-[Sora] text-center mt-[40px]"
                >
                  Withdrawal ticket
                </Dialog.Title>

                <p className="text-dark-grafiti-medium text-lg font-normal w-full max-w-[607px] text-center mx-auto mt-5 mb-[61px]">
                  The number below is your withdrawal ticket, and it will be
                  necessary to withdraw the funds you’ve deposited. The ticket
                  is downloaded automatically to ensure that you do not forget
                  to manually copy or download. We also encourage you to copy
                  this number and paste it in a notepad or somewhere else safe.
                  <strong className="text-error block">
                    If you lose this ticket you’ll lose your funds
                  </strong>
                </p>

                <p className="text-error text-sm font-normal text-center mt-[19px]">
                  {errorMessage}
                </p>
                <div
                  className={`flex items-center bg-soft-blue-normal rounded-[15px] w-full max-w-[609px] mx-auto border-[2px] ${
                    errorMessage
                      ? "border-error mt-0"
                      : copy
                      ? "border-success"
                      : "border-transparent"
                  }`}
                >
                  <p
                    className={`${
                      copy ? "text-success" : "text-dark-grafiti-medium"
                    } text-sm font-semibold truncate w-full p-3 pl-10`}
                  >
                    {note}
                  </p>
                  <CopyToClipboard
                    text={note}
                    onCopy={() => {
                      setCopy(true);
                      setErrorMessage("");
                    }}
                  >
                    <button
                      className={`flex items-center gap-3 pr-10 ${
                        copy ? "text-success" : "text-dark-grafiti-medium"
                      } text-sm font-normal`}
                    >
                      <img
                        src={copy ? "/copied-icon.svg" : "/copy-icon.svg"}
                        alt={copy ? "Copied Icon" : "Copy Icon"}
                      />
                      {copy ? "Copied" : "Copy"}
                    </button>
                  </CopyToClipboard>
                </div>
                <p className="text-dark-grafiti-medium flex gap-3 w-full max-w-[609px] mx-auto pl-3 mt-2">
                  or{" "}
                  <span
                    className="text-info underline flex gap-3 cursor-pointer"
                    onClick={() => {
                      setCopy(true);
                      setErrorMessage("");
                    }}
                  >
                    <img src="/download-icon.svg" alt="Download Icon" />{" "}
                    <DownloadLink
                      style={{ margin: 0 }}
                      label="Download your ticket in txt file"
                      filename="ticket.txt"
                      exportFile={() => {
                        setCopy(true);
                        setErrorMessage("");
                        return note;
                      }}
                    />
                  </span>
                </p>
                <p className="text-black text-lg font-normal w-full max-w-[607px] text-center mx-auto mt-[50px]">
                  To ensure the anonymity of your transaction, we recommend you
                  wait <strong>at least 30 minutes</strong> to withdraw the
                  funds deposited.{" "}
                </p>
                <button
                  disabled={sending}
                  onClick={() => deposit()}
                  className="block bg-soft-blue-from-deep-blue mt-[53px] p-[12px] mx-auto mb-[90px] rounded-full w-full max-w-[367px] font-[400] hover:opacity-[.9] disabled:opacity-[.6] disabled:cursor-not-allowed"
                >
                  {buttonText
                    ? buttonText
                    : `Deposit ${Number(
                        formatBigNumberWithDecimals(
                          amount,
                          getDecimals(
                            token.type === "Near" ? 24 : token.metadata.decimals
                          )
                        )
                      ).toFixed(0)} ${token.metadata.name}`}
                </button>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
