import HashModal from "./hash-modal";
import { Fragment, useState } from "react";
import { RadioGroup, Listbox, Transition } from "@headlessui/react";
import { useApplication } from "@/store/application";
import { useWalletSelector } from "@/utils/context/wallet";
import {
  QuestionMarkCircleIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { FixedValuesModal } from "@/components/modals/fixedValues";
import { useAction } from "@/hooks/useAction";

const amounts = [0.1, 1, 10, 20, 50];

const people = [
  { id: 1, name: "Near", unavailable: false },
  { id: 2, name: "Ethereum", unavailable: false },
  { id: 3, name: "Solana", unavailable: false },
  { id: 4, name: "Maui", unavailable: true },
  { id: 5, name: "Token", unavailable: false },
];

const transactionHashes = new URLSearchParams(window.location.search).get(
  "transactionHashes"
);

export function Deposit() {
  const [showModal, setShowModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<string>("0");
  const [buttonText, setButtonText] = useState("Deposit");
  const [depositing, setDepositing] = useState(false);
  const [selectedToken, setSelectedToken] = useState<any>();
  const [errorMessage, setErrorMessage] = useState<string>("");

  const { prepareDeposit } = useApplication();
  const { selector, accountId, toggleModal } = useWalletSelector();

  const { action } = useAction(transactionHashes!, accountId!);

  const preDeposit = async () => {
    if (!accountId) {
      toggleModal();

      return;
    }

    if (!selectedAmount || !selectedToken) {
      setErrorMessage("Select token and amount to deposit");
      return;
    }

    setDepositing(true);
    setButtonText("Preparing your deposit...");

    await prepareDeposit(selector, accountId!);

    setShowModal(!showModal);
  };

  return (
    <div>
      <div>
        <div>
          <div className="flex items-center justify-between">
            <span className="text-black text-[1.1rem] font-bold">
              Choose token{" "}
              <span className="text-error">{errorMessage && "*"}</span>
            </span>
          </div>
          <Listbox value={selectedToken} onChange={setSelectedToken}>
            <div className="relative mt-1">
              <Listbox.Button
                className={`cursor-pointer relative w-full rounded-[15px] bg-soft-blue-normal py-3 pl-3 pr-10 text-left border-[2px] ${
                  errorMessage ? "border-error" : "border-transparent"
                } focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm`}
              >
                <span className="block truncate text-dark-grafiti font-normal">
                  {selectedToken && selectedToken.name
                    ? selectedToken.name
                    : "Select token"}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronDownIcon
                    className="h-5 w-5 text-gray-400 font-bold"
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
                <Listbox.Options className="absolute mt-1 max-h-60 w-[200px] overflow-auto rounded-lg bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {people.map((person, personIdx) => (
                    <Listbox.Option
                      key={personIdx}
                      className={({ active }) =>
                        `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                          active
                            ? "bg-soft-blue-normal text-dark-grafiti"
                            : "text-dark-grafiti"
                        }`
                      }
                      value={person}
                    >
                      {({ selected }) => (
                        <>
                          <span className={`flex gap-5 truncate font-bold`}>
                            <div
                              className={`w-4 h-4  rounded-[50%] ${
                                selected ? "bg-success" : "bg-gray-300"
                              }`}
                            />{" "}
                            {person.name}
                          </span>
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between">
            <span className="text-black text-[1.1rem] font-bold ">
              Amount <span className="text-error">{errorMessage && "*"}</span>
            </span>
          </div>

          <RadioGroup
            value={selectedAmount}
            onChange={setSelectedAmount}
            className="mt-2 max-w-[371px] overflow-x-auto"
          >
            <div className="flex space-x-[12px] w-[500px] py-2">
              {amounts.map((size) => (
                <RadioGroup.Option
                  key={size}
                  value={size}
                  className={({ checked }) => `
                    p-3 shadow-md shadow-soft-blue rounded-full w-[118px] flex items-center justify-center cursor-pointer ${
                      checked ? "bg-soft-blue-nromal" : ""
                    }
                  `}
                >
                  <RadioGroup.Label
                    as="span"
                    className="whitespace-nowrap space-x-[4px] font-bold text-soft-blue"
                  >
                    {size} NEAR
                  </RadioGroup.Label>
                </RadioGroup.Option>
              ))}
            </div>
          </RadioGroup>
          <p
            className="text-info font-normal text-sm underline flex items-center gap-2 cursor-pointer mt-2"
            onClick={() => setIsOpen(true)}
          >
            Why use fixed values <QuestionMarkCircleIcon className="w-4 h-4" />
          </p>
        </div>

        <div className="mt-16 mb-16">
          <div className="flex items-center justify-between">
            <span className="text-black text-[1.1rem] font-bold ">
              Transaction Anonimity
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            {[1, 2, 3].map((item) => (
              <>
                <div className="w-[77px] h-[9px] bg-gray-300 rounded-full" />
              </>
            ))}
          </div>
          <p className="text-info font-normal text-sm underline flex items-center gap-2 cursor-pointer mt-2">
            What is this <QuestionMarkCircleIcon className="w-4 h-4" />
          </p>
        </div>

        <p className="text-error ml-2 text-sm font-normal">{errorMessage}</p>
        <button
          disabled={depositing}
          onClick={() => preDeposit()}
          className="bg-soft-blue-from-deep-blue p-[12px] rounded-full w-full font-[400] hover:opacity-[.9] disabled:opacity-[.6] disabled:cursor-not-allowed"
        >
          {!accountId ? "Connect Wallet" : buttonText}
        </button>

        <HashModal
          isOpen={showModal}
          amount={selectedAmount}
          onClose={() => {
            setDepositing(false);
            setShowModal(!showModal);
            setButtonText("Deposit");
          }}
        />
        <FixedValuesModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </div>
    </div>
  );
}
