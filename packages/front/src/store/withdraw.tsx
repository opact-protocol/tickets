import { ToastCustom } from "@/components/shared/toast-custom";
import { useEnv } from "@/hooks/useEnv";
import { TicketStored, WithdrawStore } from "@/interfaces";
import { hycService } from "@/lib";
import { mimc } from "@/services";
import {
  getLastDepositsBeforeTheTicketWasCreated,
  getLastWithdrawBeforeTheTicketWasCreated,
  getTicketInTheMerkleTree,
} from "@/utils/graphql-queries";
import { AxiosError } from "axios";
import { Logger, parseNote, viewWasNullifierSpent } from "hideyourcash-sdk";
import { toast } from "react-toastify";
import { create } from "zustand";
import { useRelayer } from "./relayer";

export const useWithdraw = create<WithdrawStore>((set, get) => ({
  publicArgs: null,
  withdrawScore: 0,
  ticket: { contract: "", counter: "", timestamp: "", value: "" },
  errorMessage: "",
  buttonText: "Withdraw",
  generatingProof: false,
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

  preWithdraw: async (recipient: string, note: string, logger: Logger) => {
    const { ticket, prepareWithdraw, validateTicket } = get();
    const { dynamicFee, toRef } = useRelayer.getState();

    try {
      clearTimeout(toRef);

      set({
        generatingProof: true,
        buttonText: "Preparing your withdraw...",
      });
      await prepareWithdraw(
        ticket.contract,
        dynamicFee.price_token_fee,
        {
          note,
          recipient,
        },
        logger
      );
      set({ generatingProof: false });
    } catch (error) {
      console.warn(error);
      set({ generatingProof: false });
    }
  },

  generateCommitment: (ticket: string) => {
    if (ticket.length < 220) return;

    const parsedNote = parseNote(ticket);

    const secretsHash = mimc.hash(parsedNote.secret, parsedNote.nullifier);
    const commitment = mimc.hash(secretsHash, parsedNote.account_hash);

    return commitment;
  },

  validateTicket: async (ticket: string) => {
    const { generateCommitment } = get();
    if (ticket.length < 220) {
      set({ errorMessage: "Ticket invalid" });
      return false;
    }

    const commitment = generateCommitment(ticket);

    const ticketStored: TicketStored = await getTicketInTheMerkleTree(
      commitment!
    );

    if (!ticketStored) {
      set({ errorMessage: "This ticket has not been deposited yet" });
      return false;
    }

    const wasNullifierSpent = await viewWasNullifierSpent(
      useEnv("VITE_NEAR_NODE_URL"),
      ticket
    );

    if (wasNullifierSpent) {
      set({ errorMessage: "This ticket is not valid anymore" });
      return false;
    }

    set({ ticket: ticketStored, errorMessage: "" });
    return true;
  },
}));
