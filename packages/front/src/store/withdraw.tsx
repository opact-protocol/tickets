import { ToastCustom } from "@/components/shared/toast-custom";
import { WithdrawStore } from "@/interfaces";
import { hycService } from "@/lib";
import {
  getLastDepositsBeforeTheTicketWasCreated,
  getLastWithdrawBeforeTheTicketWasCreated,
  getTicketInTheMerkleTree,
} from "@/utils/graphql-queries";
import { AxiosError } from "axios";
import { Logger } from "hideyourcash-sdk";
import { toast } from "react-toastify";
import { create } from "zustand";
import { useRelayer } from "./relayer";

export const useWithdraw = create<WithdrawStore>((set, get) => ({
  publicArgs: null,
  withdrawScore: 0,
  prepareWithdraw: async (
    currencyContract: string,
    fee: string,
    { note, recipient },
    logger: Logger
  ) => {
    const { relayerData } = useRelayer.getState();

    try {
      const publicArgs = await hycService.prepareWithdraw(
        fee,
        note,
        relayerData,
        recipient,
        currencyContract,
        logger
      );

      set({
        publicArgs,
      });
    } catch (e) {
      console.error("prepareWithdraw", e);

      if (e instanceof Error) {
        throw new Error(e.message);
      }
    }
  },
  sendWithdraw: async () => {
    const { publicArgs } = get();
    const { relayerJWT, relayerData } = useRelayer.getState();

    try {
      await hycService.sendWithdraw(relayerData, {
        publicArgs,
        token: relayerJWT,
      });
      toast(
        <ToastCustom
          icon="/check-circle-icon.svg"
          title="Withdrawal sent"
          message="The funds have been withdrawn with success to the address"
        />,
        {
          toastId: "withdraw-toast",
        }
      );
    } catch (error) {
      if (error instanceof AxiosError) {
        toast(
          <ToastCustom
            icon="/error-circle-icon.svg"
            title="Withdraw error"
            message={error.response?.data.error}
          />,
          {
            toastId: "withdraw-toast",
          }
        );
      }
      console.log(error);
    }
  },
  poolWithdrawScore: async (commitment: string) => {
    const tickedStored = await getTicketInTheMerkleTree(commitment);
    const lastWithdrawal = await getLastWithdrawBeforeTheTicketWasCreated(
      tickedStored.timestamp
    );
    const lastDeposit = await getLastDepositsBeforeTheTicketWasCreated(
      tickedStored.timestamp
    );

    const pastTime = Date.now();

    const score = lastWithdrawal + lastDeposit + pastTime / 3600;

    set({ withdrawScore: score });
  },
}));
