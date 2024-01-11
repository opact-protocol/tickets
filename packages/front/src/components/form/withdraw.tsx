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
          className={loadingData ? 'pt-[16px]' : 'pt-0'}
        >
          <If
            condition={loadingData}
          >
            <div
              className="mb-[16px] border-[#F8D45C] bg-[#2D2A1C] px-4 py-2 border rounded-[8px] relative z-[0]"
            >
              <div>
                <span
                  className="text-font-1 text-xxs font-[600]"
                >
                  Download security files
                </span>
              </div>

              <div v-if="desc">
                <span
                  className="text-font-1 text-xxs font-[500]"
                >
                  Opact Tickets needs to download the security files so that you can proceed with the withdrawal.
                </span>
              </div>
            </div>
          </If>

          <WithdrawButton
            buttonText={state.buttonText}
            onClick={() => preWithdraw(loadingData)}
            isLoading={state.loading || loadingData}
            isDisabled={!state.fee.token || state.loading || state.isDisabled || loadingData}
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
