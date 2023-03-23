import type { Logger } from "hideyourcash-sdk";

export interface WithdrawStore {
  prepareWithdraw: (
    currencyContract: string,
    fee: string,
    payload: { note: string; recipient: string },
    logger: Logger
  ) => Promise<void>;
  sendWithdraw: () => Promise<void>;
  poolWithdrawScore: (commitment: string) => Promise<void>;
  validateTicket: (ticket: string) => Promise<boolean>;
  generateCommitment: (ticket: string) => string | undefined;
  preWithdraw: (
    recipient: string,
    note: string,
    logger: Logger
  ) => Promise<void>;
  errorMessage: string;
  ticket: TicketStored;
  withdrawScore: number;
  buttonText: string;
  generatingProof: boolean;
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
