import { useToast } from "./useToast";
import { debounce } from "@/utils/debounce";
import { useCallback, useReducer } from "react";
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

const baseArgs = {
  note: '',
  token: '',
  receiver: '',
  noteError: '',
  receiverError: '',
  buttonText: 'Withdraw',
  progress: 'Reading Wtns',

  loading: false,
  isDisabled: false,
  isValidTicket: false,
  isValidReceiver: false,
  generatingProof: false,
  showConfirmModal: false,
  showWithdrawWarn: false,

  fee: { ...baseFee },

  publicArgs: null,
  ticket: null,
  relayer: null

}

const reducer = (state, value) => {
  return {
    ...state,
    ...value,
  }
}

export const useWithdraw = () => {
  const [state, dispatch] = useReducer(reducer, { ...baseArgs })

  const reset = () => {
    dispatch({ ...baseArgs })
  }

  const preWithdraw = useCallback(async (loadingData) => {
    if (loadingData) {
      dispatch({
        isDisable: true,
        setShowWithdrawWarn: true,
        buttonText: 'Downloading security files...'
      })

      return
    }

    if (!state.relayer || !state.receiver || !state.ticket) {
      return
    }

    try {
      dispatch({
        loading: true
      })

      const publicArgs = await buildProof({
        fee: state.fee,
        note: state.note,
        ticket: state.ticket,
        relayer: state.relayer,
        receiver: state.receiver,
        callbackProgress: (message: string) => {
          if (message === 'start') {
            dispatch({
              loading: false,
              generatingProof: true
            })

            return
          }

          dispatch({
            progress: message
          })
        }
      })

      dispatch({
        publicArgs: { ...publicArgs },
        showConfirmModal: true
      })
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
      dispatch({
        loading: false,
        generatingProof: false
      })
    }
  }, [state.fee, state.note, state.relayer, state.receiver, state.ticket, state.progress])

  const send = async () => {
    if (!state.relayer) {
      return
    }

    try {

      await sendWithdraw({
        token: state.token,
        relayer: state.relayer,
        publicArgs: state.publicArgs,
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

  const validateTicket = debounce(async (rawNote: string) => {
    if (!rawNote) {
      dispatch({
        noteError: '',
        isValidTicket: false
      })

      return
    }

    dispatch({
      loading: true,
    })

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
      dispatch({
        loading: false,
        noteError: message
      })

      return
    }

    // TODO: POOL WITHDRAW SCORE HERE
    dispatch({
      ticket,
      noteError: '',
      loading: false,
      isValidTicket: isValid,
    })
  }, 1000)

  const checkRelayerFee = useCallback(debounce(async (address: string) => {
    dispatch({
      fee: { ...baseFee }
    })

    if (!address || !state.ticket) {
      dispatch({
        receiverError: '',
        isValidReceiver: false
      })

      return;
    }

    const relayer = await fetchRelayer()

    dispatch({
      loading: true,
      receiverError: '',
      isValidReceiver: false
    })

    try {
      const { data } = await calculateRelayerFee({
        relayer,
        address,
        contract: state.ticket.contract,
      });

      dispatch({
        fee: data,
        token: data.token,
        isValidReceiver: true
      })
    } catch (error) {
      console.warn(error);

      dispatch({
        fee: { ...baseFee },
        receiverError: 'Your recipient address is not valid',
        isValidReceiver: false
      })
    } finally {
      dispatch({
        loading: false
      })
    }
  }, 1000), [state.ticket, state.loading])

  const fetchRelayer = useCallback(async () => {
    if (state.relayer) {
      return state.relayer
    }

    const newRelayer = await randomRelayer()

    dispatch({
      relayer: newRelayer
    })

    return newRelayer
  }, [state.relayer])

  return {
    state,

    send,
    reset,
    dispatch,
    preWithdraw,
    validateTicket,
    checkRelayerFee,
  }
}

export default useWithdraw
