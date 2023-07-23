import type { Logger } from "hideyourcash-sdk";

export interface WithdrawStore {
  prepareWithdraw: (
    currencyContract: string,
    fee: string,
    payload: { note: string; recipient: string },
    logger: Logger,
    builder: any
  ) => Promise<void>;
  sendWithdraw: () => Promise<void>;
  poolWithdrawScore: () => Promise<void>;
  validateTicket: (ticket: string) => void;
  preWithdraw: (logger: () => {}, builder: any) => Promise<void>;
  handleRecipientAddress: (address: string) => void;
  cleanupInputs: () => void;
  resetForm: (skip?: string[]) => void;
  handleNote: (value: string) => void;
  errorMessage: string;
  ticket: TicketStored | null;
  withdrawScore: number;
  buttonText: string;
  generatingProof: boolean;
  note: string;
  commitment: string;
  recipientAddress: string;
  publicArgs: any;
  validatingTicket: boolean;
}

export interface TicketStored {
  contract: string;
  counter: string;
  timestamp: string;
  value: string;
}

export interface WithdrawProps {
  ticket: string;
  address: string;
}
