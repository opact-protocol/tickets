import { Input } from "../input";
import { If } from "@/components/if";
import ConfirmModal from "./confirm-modal";
import { useCallback } from "react";
import { useWithdraw } from '@/hooks/useWithdraw'
import { WithdrawButton } from "./withdraw-button";
import { ProofProgress } from "./proof-progress";
import { WithdrawData } from "./withdraw-data";

const transactionHashes = new URLSearchParams(window.location.search).get(
  "transactionHashes"
);

const HYC_TRANSACTION = "hyc-transaction";

export function Withdraw() {
  const {
    fee,
    note,
    ticket,
    loading,
    progress,
    publicArgs,
    receiver,
    noteError,
    buttonText,
    isValidTicket,
    receiverError,
    generatingProof,
    isValidReceiver,
    showConfirmModal,
    send,
    reset,
    setNote,
    preWithdraw,
    setReceiver,
    validateTicket,
    checkRelayerFee,
  } = useWithdraw()

  if (transactionHashes) {
    localStorage.setItem(HYC_TRANSACTION, JSON.stringify(true));
  }

  const handleNote = useCallback(async (note: string) => {
    setNote(note)

    validateTicket(note)
  }, [note])

  const handleReceiver = useCallback(async (receiver: string) => {
    setReceiver(receiver)

    checkRelayerFee(receiver);
  }, [receiver])

  return (
    <div className="space-y-[24px]">
      <Input
        value={note}
        error={noteError}
        isValid={isValidTicket}
        isDisabled={generatingProof}
        label="Withdrawal ticket"
        placeholder="Paste your withdraw ticket"
        onChange={(value) => handleNote(value as string)}
      />

      <Input
        value={receiver}
        isDisabled={!ticket || generatingProof}
        error={receiverError}
        isValid={isValidReceiver}
        label="Recipient Address"
        placeholder="Wallet Address"
        onChange={(value) => handleReceiver(value as string)}
      />

      <WithdrawData
        fee={fee}
        loading={loading}
        publicArgs={!!publicArgs}
        isOpen={isValidTicket && isValidReceiver}
      />


      <If condition={generatingProof && !publicArgs && !loading}>
        <ProofProgress
          progress={progress}
          generatingProof={generatingProof}
        />
      </If>

      <If condition={!generatingProof || !!publicArgs}>
        <div
          className="pt-[16px]"
        >
          <WithdrawButton
            isLoading={loading}
            buttonText={buttonText}
            onClick={() => preWithdraw()}
            isDisabled={!fee.token || loading}
          />
        </div>
      </If>

      <ConfirmModal
        send={send}
        isOpen={showConfirmModal}
        onClose={() => {
          reset()
        }}
        cleanupInputsCallback={() => reset()}
      />
    </div>
  );
}
