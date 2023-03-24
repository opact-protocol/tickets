import type { Logger } from "hideyourcash-sdk";

export interface WithdrawStore {
  prepareWithdraw: (
    currencyContract: string,
    fee: string,
    payload: { note: string; recipient: string },
    logger: Logger
  ) => Promise<void>;
  sendWithdraw: () => Promise<void>;
  poolWithdrawScore: () => Promise<void>;
  validateTicket: (ticket: string) => Promise<boolean>;
  // generateCommitment: (ticket: string) => string | undefined;
  preWithdraw: (logger: Logger) => Promise<void>;
  handleRecipientAddress: (address: string) => void;
  cleanupInputs: () => void;
  handleNote: (value: string) => void;
  errorMessage: string;
  ticket: TicketStored;
  withdrawScore: number;
  buttonText: string;
  generatingProof: boolean;
  note: string;
  commitment: string;
  recipientAddress: string;
  publicArgs: any;
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
