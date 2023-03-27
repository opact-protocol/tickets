import {
  Currency,
  CurrencyContract,
  ViewCurrenciesResponseInterface,
} from "hideyourcash-sdk";

export interface DepositStore {
  sendDeposit: (
    amount: string,
    contract: string,
    accountId: string,
    currency: Currency,
    connection: any
  ) => Promise<void>;
  prepareDeposit: (
    account: string,
    currencieContract: string
  ) => Promise<string>;
  preDeposit: (haveBalance: boolean) => Promise<void>;
  deposit: () => Promise<void>;
  poolDepositScore: () => Promise<void>;
  setSelectedToken: (payload: ViewCurrenciesResponseInterface) => void;
  setSelectedAmount: (payload: AmountsProps) => void;
  setCopyTicket: (state: boolean) => void;
  setAllowlistModal: (state: boolean) => void;
  formatAmounts: (data: CurrencyContract) => CurrencyContract[];
  depositScore: number;
  hash: string;
  note: string;
  errorMessage: string;
  selectedToken: any;
  selectedAmount: AmountsProps;
  copyTicket: boolean;
  sendingDeposit: boolean;
  showAllowlistModal: boolean;
  depositing: boolean;
  buttonText: string;
}

export interface AmountsProps {
  value: string;
  accountId: string;
}
