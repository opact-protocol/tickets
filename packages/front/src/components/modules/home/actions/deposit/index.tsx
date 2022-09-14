import HashModal from "./hash-modal";
import { useState } from "react";
import { RadioGroup } from "@headlessui/react";
import { useApplication } from "@/store/application";
import { useNearWalletSelector } from "@/utils/context/wallet";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

const amounts = [0.1, 1, 10, 100];

const classNames = (...classes) => classes.filter(Boolean).join(" ");

export function Deposit() {
  const [showModal, setShowModal] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(1);
  const [buttonText, setButtonText] = useState("Deposit");
  const [depositing, setDepositing] = useState(false);

  const { prepareDeposit } = useApplication();
  const { connection, accountId, toggleModal } = useNearWalletSelector();

  const preDeposit = async () => {
    if (!accountId) {
      toggleModal();

      return;
    }

    setDepositing(true);
    setButtonText("Preparing your deposit...");

    await prepareDeposit(connection, accountId!);

    setShowModal(!showModal);
  };

  return (
    <div className="w-[500px] bg-white rounded-2xl border border-gray-200 px-9 py-8 mx-auto">
      <div className="mb-[28px]">
        <span className="text-[18px] leading-6 text-gray-900 font-[500]">
          Deposit
        </span>
      </div>

      <div>
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[#121315] text-[1.1rem] font-[500]">
              Token
            </span>

            <div className="text-[#121315] space-x-[4px]">
              <span>In wallet:</span>
              <span>10</span>
            </div>
          </div>

          <div
            className="
              mt-2
              p-[8px]
              h-[43px]
              bg-[#f7f8fa]
              rounded-full
              text-[#121315]
              cursor-pointer
              opacity-[.8]
              cursor-not-allowed
              flex items-center justify-between
            "
          >
            <div className="flex items-center space-x-[8px]">
              <div className="bg-[#121315] rounded-full h-[24px] w-[24px]" />

              <span className="text-[18px] font-[400]">NEAR</span>
            </div>

            <ChevronRightIcon className="h-[16px] w-[16px]" />
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between">
            <span className="text-[#121315] text-[1.1rem] font-[500]">
              Amount
            </span>
          </div>

          <RadioGroup
            value={selectedAmount}
            onChange={setSelectedAmount}
            className="mt-2"
          >
            <div className="flex space-x-[12px]">
              {amounts.map((size) => (
                <RadioGroup.Option
                  key={size}
                  value={size}
                  className={({ checked }) =>
                    classNames(
                      checked
                        ? "bg-gray-100 border-transparent text-black"
                        : "bg-white border-gray-200 text-gray-900 hover:bg-gray-50",
                      "border rounded-full p-3 flex items-center justify-center text-sm font-medium uppercase sm:flex-1 cursor-pointer"
                    )
                  }
                >
                  <RadioGroup.Label
                    as="span"
                    className="whitespace-nowrap space-x-[4px]"
                  >
                    {size} NEAR
                  </RadioGroup.Label>
                </RadioGroup.Option>
              ))}
            </div>
          </RadioGroup>
        </div>

        <div>
          <button
            disabled={depositing}
            children={!accountId ? "Connect Wallet" : buttonText}
            onClick={() => preDeposit()}
            className="bg-[#121315] mt-[24px] p-[12px] rounded-full w-full font-[400] hover:opacity-[.9] disabled:opacity-[.6] disabled:cursor-not-allowed"
          />
        </div>

        <HashModal
          isOpen={showModal}
          onClose={() => {
            setDepositing(false);
            setShowModal(!showModal);
            setButtonText("Deposit");
          }}
        />
      </div>
    </div>
  );
}
