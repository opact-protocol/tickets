import { Logger } from "hideyourcash-sdk";

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
