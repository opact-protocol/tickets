import { ConnectionType, Currency } from "hideyourcash-sdk";

export interface BuildProof {
  fee: any;
  ticket: any;
  note: string;
  relayer: any;
  receiver: any;
  callbackProgress: any;
}

export interface TicketIsValid {
  note: string;
}

export interface ValidatedTicket {
  ticket?: any;
  message: string;
  isValid: boolean;
}

export interface Send {
  token: any;
  relayer: any;
  publicArgs: any;
}

export interface CalculateRelayerFee {
  relayer: any;
  address: string;
  contract: string;
}

export interface GetTicketInterface {
  accountId: string;
  instanceId: string;
}

export interface SendDepositInterface {
  hash: string,
  amount: string,
  accountId: string,
  depositContract: string,

  currency: Currency;
  connection: ConnectionType;
}
