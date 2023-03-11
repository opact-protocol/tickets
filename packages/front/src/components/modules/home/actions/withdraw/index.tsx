import ConfirmModal from "./confirm-modal";
import { useApplication } from "@/store";
import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { LoadingModal } from "@/components/modals/loading";
import { getTicketInTheMerkleTree } from "@/utils/graphql-queries";
import { generateCommitment } from "@/utils/generate-commitment";
import { ToastCustom } from "@/components/shared/toast-custom";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useWallet } from "@/store/wallet";
import { viewWasNullifierSpent } from "hideyourcash-sdk";
import { useEnv } from "@/hooks/useEnv";
import { useWithdrawalScore } from "@/hooks/useWithdrawalScore";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

interface WithDrawProps {
  ticket: string;
  address: string;
}

const transactionHashes = new URLSearchParams(window.location.search).get(
  "transactionHashes"
);

const hycTransaction = "hyc-transaction";

export function Withdraw() {
  const [showModal, setShowModal] = useState(false);
  const [generatingProof, setGeneratinProof] = useState(false);
  const buttonText = useRef("Withdraw");
  const [ticket, setTicket] = useState<any>();

  const { prepareWithdraw, relayerData, fetchRelayerData } = useApplication();
  const { accountId, toggleModal } = useWallet();
  const withdrawSchema = yup.object().shape({
    ticket: yup
      .string()
      .min(220, "This ticket is invalid")
      .required("Invalid withdraw ticket")
      .test(
        "isValidTicket",
        "This ticket is not valid anymore",
        async (value) => {
          const commitment = generateCommitment(value);
          const ticketStored = await getTicketInTheMerkleTree(commitment!);
          try {
            setTicket(ticketStored);
            return !(await viewWasNullifierSpent(
              useEnv("VITE_NEAR_NODE_URL"),
              ticketStored.contract,
              value
            ));
          } catch (error) {
            return false;
          }
        }
      )
      .test(
        "isStored",
        "This ticket has not been deposited yet",
        async (value) => {
          const commitment = generateCommitment(value);

          const ticketStored = await getTicketInTheMerkleTree(commitment!);

          if (!ticketStored) return false;

          return true;
        }
      ),
    address: yup
      .string()
      .min(1, "This address is invalid")
      .required("Invalid address"),
  });

  const { withdrawalScore } = useWithdrawalScore(ticket ? ticket.value : "");

  const {
    register,
    handleSubmit,
    getFieldState,
    formState: { errors },
  } = useForm<WithDrawProps>({
    resolver: yupResolver(withdrawSchema),
    mode: "onChange",
  });

  if (transactionHashes) {
    localStorage.setItem(hycTransaction, JSON.stringify(true));
  }

  const preWithdraw = async (data: WithDrawProps) => {
    if (!accountId) {
      toggleModal();
      return;
    }
    try {
      buttonText.current = "Preparing your withdraw...";
      setGeneratinProof(true);
      await prepareWithdraw(ticket.contract, {
        note: data.ticket,
        recipient: data.address,
      });
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
    }
  };

  useEffect(() => {
    if (!relayerData) {
      fetchRelayerData();
    }
  }, []);

  return (
    <>
      <div>
        <form onSubmit={handleSubmit(preWithdraw)}>
          <div className={`mb-5`}>
            <div className="flex items-center justify-between">
              <span className="text-black text-[1.1rem] font-bold">
                Withdraw ticket{" "}
                {errors.ticket?.message && (
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
                  errors.ticket?.message ? "border-error" : "border-transparent"
                }
              `}
                  {...register("ticket")}
                  autoComplete="off"
                  placeholder="Paste your withdraw ticked"
                />
              </div>
              <p className="text-error mt-2 text-sm font-normal">
                {errors.ticket?.message && errors.ticket.message.toString()}
              </p>
              {ticket && !getFieldState("ticket").invalid && (
                <div className="my-5">
                  <div className="flex items-center justify-between">
                    <span className="text-black text-[1.1rem] font-bold ">
                      Pool Anonimity
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {withdrawalScore < 30 ? (
                      <>
                        {[1, 2, 3].map((item) => (
                          <div
                            key={item}
                            className={`w-[77px] h-[9px] ${
                              item === 1 ? "bg-error" : "bg-gray-300"
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
                              item !== 3 ? "bg-warning" : "bg-gray-300"
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
                    className="text-info font-normal text-sm underline flex items-center gap-2 mt-2 cursor-not-allowed"
                    title="Coming soon"
                  >
                    What is this <QuestionMarkCircleIcon className="w-4 h-4" />
                  </p>
                </div>
              )}
            </div>
            <div className={`mt-8 ${relayerData ? "mb-6" : "mb-44"}`}>
              <div className="flex items-center justify-between">
                <span className="text-black text-[1.1rem] font-bold">
                  Recipient Address{" "}
                  {errors.address?.message && (
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
                 errors.address?.message ? "border-error" : "border-transparent"
               }
             `}
                  placeholder="Wallet Address"
                  autoComplete="off"
                  {...register("address")}
                />
              </div>
              <p className="text-error mt-2 text-sm font-normal">
                {errors.address?.message?.toString()}
              </p>
            </div>
          </div>
          {relayerData && ticket && !getFieldState("ticket").invalid && (
            <div className="mt-[24px]">
              <div>
                <span className="text-black font-bold">Total</span>
              </div>

              <div className="flex flex-col w-full mt-2">
                {/* <div className="flex items-center justify-between pb-[12px]">
                <span className="text-black text-[14px]">Network fee</span>

                <span className="text-black font-bold">{`${10} NEAR`}</span>
              </div> */}

                <div className="flex items-center justify-between pb-[12px]">
                  <span className="text-black text-[14px]">Relayer fee:</span>

                  <span className="text-black font-bold">{`${
                    +relayerData.feePercent * 10
                  } NEAR`}</span>
                </div>
                {/* <div className="flex items-center justify-between pb-[12px]">
                <span className="text-black text-[14px]">Total fee:</span>

                <span className="text-black font-bold">{`${
                  relayerData.feePercent
                } NEAR`}</span>
              </div> */}

                <div className="flex items-center justify-between mt-4">
                  <span className="text-black text-[14px]">
                    Tokens to receive:
                  </span>

                  <span className="text-black font-bold">{`${
                    10 * (1 - +relayerData.feePercent)
                  } NEAR`}</span>
                </div>
              </div>
            </div>
          )}

          {generatingProof ? (
            <LoadingModal generatingProof={generatingProof} />
          ) : (
            <div>
              <button
                type="submit"
                className="bg-soft-blue-from-deep-blue mt-[12px] p-[12px] rounded-full w-full font-[400] hover:opacity-[.9] disabled:opacity-[.6] disabled:cursor-not-allowed"
              >
                {" "}
                {!accountId
                  ? "Connect Wallet"
                  : !showModal
                  ? "Withdraw"
                  : buttonText.current}{" "}
              </button>
            </div>
          )}
          <ConfirmModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
          />
        </form>
      </div>
      {generatingProof && (
        <div className="bg-transparent w-screen h-screen absolute -top-[40%] -left-10 sm:-left-[25%] md:-left-[35%] lg:-left-[50%] xl:-left-[108%] z-[99999] overflow-hidden" />
      )}
    </>
  );
}
