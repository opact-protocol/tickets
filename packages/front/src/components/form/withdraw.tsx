import { Input } from "../input";
import { useCallback, useEffect } from "react";
import { If } from "@/components/if";
import ConfirmModal from "./confirm-modal";
import { useWithdraw } from '@/hooks/withdraw'
import { WithdrawButton } from "./withdraw-button";
import { ProofProgress } from "./proof-progress";
import { WithdrawData } from "./withdraw-data";
import { WithdrawWarn } from './withdraw-warn'
import { useWallet } from "@/store";

const transactionHashes = new URLSearchParams(window.location.search).get(
  "transactionHashes"
);

const HYC_TRANSACTION = "hyc-transaction";

export function Withdraw() {
  const {
    state,

    send,
    reset,
    dispatch,
    preWithdraw,
    validateTicket,
    checkRelayerFee,
  } = useWithdraw()

  if (transactionHashes) {
    localStorage.setItem(HYC_TRANSACTION, JSON.stringify(true));
  }

  const handleNote = useCallback(async (note: string) => {
    dispatch({ note })

    validateTicket(note)
  }, [state.note])

  const handleReceiver = useCallback(async (receiver: string) => {
    dispatch({
      receiver
    })

    checkRelayerFee(receiver)
  }, [state.receiver, state.ticket])

  const { loadingData } = useWallet()

  useEffect(() => {
    if (loadingData) {
      return
    }

    dispatch({
      isDisabled: false,
      buttonText: 'Withdraw',
      showWithdrawWarn: false,
    })
  }, [loadingData])

  return (
    <div className="space-y-[24px]">
      <Input
        value={state.note}
        error={state.noteError}
        isValid={state.isValidTicket}
        isDisabled={state.generatingProof}
        label="Withdrawal ticket"
        placeholder="Paste your withdraw ticket"
        onChange={(value) => handleNote(value as string)}
      />

      <Input
        value={state.receiver}
        isDisabled={!state.ticket || state.generatingProof}
        error={state.receiverError}
        isValid={state.isValidReceiver}
        label="Recipient Address"
        placeholder="Wallet Address"
        onChange={(value) => handleReceiver(value as string)}
      />

      <WithdrawData
        fee={state.fee}
        loading={state.loading}
        publicArgs={!!state.publicArgs}
        isOpen={state.isValidTicket && state.isValidReceiver}
      />


      <If condition={state.generatingProof && !state.publicArgs && !state.loading}>
        <ProofProgress
          progress={state.progress}
          generatingProof={state.generatingProof}
        />
      </If>

      <If condition={!state.generatingProof || !!state.publicArgs}>
        <div
          className="pt-[16px]"
        >
          <WithdrawButton
            isLoading={state.loading}
            buttonText={state.buttonText}
            isDisabled={!state.fee.token || state.loading || state.isDisabled}
            onClick={() => preWithdraw(loadingData)}
          />
        </div>
      </If>

      <ConfirmModal
        send={send}
        isOpen={state.showConfirmModal}
        onClose={() => {
          reset()
        }}
        cleanupInputsCallback={() => reset()}
      />

      <WithdrawWarn
        isOpen={state.showWithdrawWarn}
        closeModal={() => { dispatch({ showWithdrawWarn: false }) }}
      />
    </div>
  );
}
