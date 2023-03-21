import type { WalletSelector } from "@near-wallet-selector/core";
import type {
  Currency,
  CurrencyContract,
  Logger,
  RelayerDataInterface,
  ViewCurrenciesResponseInterface,
} from "hideyourcash-sdk";

export interface AppStore {
  initApp: () => Promise<void>;
  getAllCurrencies: () => Promise<void>;
  viewIsInAllowlist: () => Promise<void>;
  allCurrencies: ViewCurrenciesResponseInterface[];
  allowlist: boolean;
  appStarted: boolean;
}

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
  preDeposit: () => Promise<void>;
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
  selectedToken: ViewCurrenciesResponseInterface;
  selectedAmount: AmountsProps;
  copyTicket: boolean;
  sendingDeposit: boolean;
  showAllowlistModal: boolean;
  depositing: boolean;
  buttonText: string;
}

export interface RelayerStore {
  fetchRelayerData: () => Promise<void>;
  setRelayerJWT: (token: string) => any;
  getRelayerFee: (
    accountId: string,
    instanceId: string,
    relayer: RelayerDataInterface
  ) => Promise<any>;
  relayerData: RelayerDataInterface;
  relayerJWT: string;
}

export interface WalletStore {
  toggleModal: () => void;
  signOut: () => Promise<void>;
  initWallet: () => Promise<string>;
  viewBalance: (
    tokenType: string,
    tokenContract: string,
    tokenValue: number
  ) => Promise<void>;
  sendWhitelist: () => Promise<void>;
  accountId: string | null;
  showWalletModal: boolean;
  selector: WalletSelector | null;
  haveBalance: boolean;
}

export interface WithdrawStore {
  prepareWithdraw: (
    currencyContract: string,
    fee: string,
    payload: { note: string; recipient: string },
    logger: Logger
  ) => Promise<void>;
  sendWithdraw: () => Promise<void>;
  poolWithdrawScore: (commitment: string) => Promise<void>;
  withdrawScore: number;
  publicArgs: any;
}

export interface ModalStore {
  toggleHashModal: () => void;
  hashModal: boolean;
  toggleConfirmWithdrawModal: () => void;
  confirmWithdrawModal: boolean;
}

export interface Balance {
  total: string;
  stateStaked: string;
  staked: string;
  available: string;
}

export interface AmountsProps {
  value: string;
  accountId: string;
}
