import { useReducer } from 'react';
import { deposit, getTicket } from '@/utils/sdk'
import type { MakeHashInterface } from './deposit.types';

const hycTransaction = "hyc-transaction";

const initialArg = {
  hash: "",
  note: "",
  errorMessage: "",
  buttonText: "Deposit",
  selectedToken: null,
  selectedAmount: null,
  depositScore: 0,
  sendingDeposit: false,
  copyTicket: false,
  showAllowlistModal: false,
  depositing: false,
  showHashModal: false,
  allCurrencies: [],
}

const reducer = (state, value) => {
  return {
    ...state,
    ...value,
  }
}

export const useDeposit = () => {
  const [state, dispatch] = useReducer(reducer, { ...initialArg })

  const makeHash = async ({
    accountId,
    haveBalance,
  }: MakeHashInterface) => {
    if (!state.selectedToken) {
      dispatch({ errorMessage: 'Select token to deposit' })

      return
    }

    if (!state.selectedAmount) {
      dispatch({ errorMessage: 'Select amount to deposit' })

      return
    }
    if (!haveBalance) {
      dispatch({ errorMessage: "Your account doesn't have enough balance" })

      return
    }

    dispatch({ buttonText: 'Preparing your deposit...', depositing: true })

    const { hash, note } = await getTicket({
      accountId,
      instanceId: state.selectedAmount!.accountId
    });

    dispatch({ buttonText: 'Deposit', showHashModal: true, showAllowlistModal: false, hash, note })
  }

  const sendDeposit = async ({
    accountId,
    connection,
  }: any) => {
    dispatch({ sendingDeposit: true })

    try {
      await deposit({
        hash: state.hash,
        amount: state.selectedAmount.value,
        depositContract: state.selectedAmount!.accountId,
        accountId,
        currency: state.selectedToken,
        connection,
      });

      localStorage.removeItem(hycTransaction);
    } catch (error) {
      console.warn(error);
    } finally {
      dispatch({ sendingDeposit: false, copyTicket: false });
    }
  }

  return {
    state,

    makeHash,
    dispatch,
    sendDeposit,
  }
}

export default useDeposit
