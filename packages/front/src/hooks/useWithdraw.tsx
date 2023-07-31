import { useToast } from "./useToast";
import { debounce } from "@/utils/debounce";
import { useCallback, useState } from "react";
import {
  buildProof,
  send as sendWithdraw,
  randomRelayer,
  ticketIsValid,
  calculateRelayerFee,
} from '@/utils/sdk'

import {
  RelayerDataInterface,
} from "hideyourcash-sdk";

export interface TicketStored {
  contract: string;
  counter: string;
  timestamp: string;
  value: string;
}

const baseFee = {
  token: "",
  price_token_fee: "",
  human_network_fee: "",
  formatted_token_fee: "",
  formatted_user_will_receive: "",

  valid_fee_for_ms: 0,
};

export const useWithdraw = () => {
  const [progress, setProgress] = useState('Reading Wtns');

  const [note, setNote] = useState('')
  const [token, setToken] = useState('')
  const [receiver, setReceiver] = useState('')
  const [noteError, setNoteError] = useState('')
  const [receiverError, setReceiverError] = useState('')
  const [buttonText, setButtonText] = useState('Withdraw')

  const [loading, setLoading] = useState(false)
  const [isValidTicket, setIsValidTicket] = useState(false)
  const [isValidReceiver, setIsValidReceiver] = useState(false)
  const [generatingProof, setGeneratingProof] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const [fee, setFee] = useState<any>({ ...baseFee })
  const [publicArgs, setPublicArgs] = useState<any | null>(null)
  const [ticket, setTicket] = useState<TicketStored | null>(null)
  const [relayer, setRelayer] = useState<RelayerDataInterface | null>(null)

  const reset = () => {
    setNote('')
    setToken('')
    setReceiver('')
    setTicket(null)
    setLoading(false)
    setRelayer(null)
    setPublicArgs(null)
    setIsValidTicket(false)
    setGeneratingProof(false)
    setIsValidReceiver(false)
    setShowConfirmModal(false)
    setButtonText('Withdraw')
  }

  const preWithdraw = useCallback(async () => {
    if (!relayer || !receiver || !ticket) {
      return
    }

    try {
      setLoading(true)

      const publicArgs = await buildProof({
        fee,
        note,
        ticket,
        relayer,
        receiver,
        callbackProgress: (message: string) => {
          if (message === 'start') {
            setLoading(false)
            setGeneratingProof(true)

            return
          }

          setProgress(message)
        }
      })

      setPublicArgs({ ...publicArgs })
      setShowConfirmModal(true)
    } catch (e) {
      console.error("prepareWithdraw", e);

      if (e instanceof Error) {
        useToast({
          variant: 'error',
          id: 'withdraw-toast',
          title: 'Proof Error',
          message: e.message,
        })

        throw new Error(e.message);
      }
    } finally {
      setLoading(false)
      setGeneratingProof(false)
    }
  }, [fee, note, relayer, receiver, ticket, progress])

  const send = async () => {
    if (!relayer) {
      return
    }

    try {

      await sendWithdraw({
        token,
        relayer,
        publicArgs,
      })

      useToast({
        variant: 'success',
        id: 'withdraw-toast',
        title: 'Withdrawal sent',
        message: 'The funds have been withdrawn with success to the address',
      })

    } catch (error: any) {
      useToast({
        variant: 'error',
        id: 'withdraw-toast',
        title: 'Withdraw error',
        message: error.response?.data.error,
      })

      console.warn(error);
    }
  }

  const validateTicket = useCallback(debounce(async (rawNote: string) => {
    if (!rawNote) {
      setNoteError('')
      setIsValidTicket(false)

      return
    }

    setLoading(true)

    let note = rawNote;

    if (!rawNote.includes('.testnet') && !rawNote.includes('.near')) {
      note = Buffer.from(rawNote, 'hex').toString();
    }

    const {
      isValid,
      message,
      ticket
    } = await ticketIsValid({ note })

    if (!isValid) {
      setLoading(false)
      setNoteError(message)

      return
    }

    // TODO: POOL WITHDRAW SCORE HERE

    setNoteError('')
    setLoading(false)
    setTicket(ticket)
    setIsValidTicket(isValid)
  }, 1000), [loading])

  const checkRelayerFee = useCallback(debounce(async (address: string) => {
    setFee({ ...baseFee })

    if (!address || !ticket) {
      setReceiverError('');
      setIsValidReceiver(false)

      return;
    }

    const relayer = await fetchRelayer()

    setLoading(true);
    setReceiverError('');
    setIsValidReceiver(false)

    try {
      const { data } = await calculateRelayerFee({
        relayer,
        address,
        contract: ticket.contract,
      });

      setFee(data)
      setToken(data.token)
      setIsValidReceiver(true)
    } catch (error) {
      console.warn(error);

      setFee({ ...baseFee })
      setReceiverError('Your recipient address is not valid');
    } finally {
      setLoading(false)
    }
  }, 1000), [ticket, loading])

  const fetchRelayer = useCallback(async () => {
    if (relayer) {
      return relayer
    }

    const newRelayer = await randomRelayer()

    setRelayer(newRelayer)

    return newRelayer
  }, [relayer])

  return {
    fee,
    note,
    token,
    ticket,
    relayer,
    loading,
    receiver,
    progress,
    noteError,
    buttonText,
    publicArgs,
    receiverError,
    isValidTicket,
    generatingProof,
    isValidReceiver,
    showConfirmModal,

    send,
    reset,
    setNote,
    setLoading,
    preWithdraw,
    setReceiver,
    validateTicket,
    checkRelayerFee,
    setShowConfirmModal,
  }
}

export default useWithdraw
