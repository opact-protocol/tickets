import { ToastCustom } from "@/components/toast-custom";
import { useEnv } from "@/hooks/useEnv";
import { TicketStored, WithdrawStore } from "@/interfaces";
import { hycService } from "@/lib";
import { debounce } from "@/utils/debounce";
import {
  getLastDepositsBeforeTheTicketWasCreated,
  getLastWithdrawBeforeTheTicketWasCreated,
  getTicketInTheMerkleTree,
} from "@/utils/graphql-queries";
import {
  Logger,
  viewWasNullifierSpent,
  getCommitmentByTicket,
} from "hideyourcash-sdk";
import { toast } from "react-toastify";
import { create } from "zustand";
import { useRelayer } from "./relayer";

const baseForm = {
  note: "",
  ticket: null,
  publicArgs: null,
  withdrawScore: 0,
  commitment: "",
  errorMessage: "",
  recipientAddress: "",
  buttonText: "Withdraw",
  generatingProof: false,
  validatingTicket: false,
};

const baseDynamicFee = {
  token: "",
  valid_fee_for_ms: 0,
  human_network_fee: "",
  price_token_fee: "",
  formatted_user_will_receive: "",
  formatted_token_fee: "",
};

export const useWithdraw = create<WithdrawStore>((set, get) => ({
  ...baseForm,

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
        relayerData!,
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
      await hycService.sendWithdraw(relayerData!, {
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
    } catch (error: any) {
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

      console.warn(error);
    }
  },
  poolWithdrawScore: async () => {
    const { commitment } = get();
    const tickedStored = await getTicketInTheMerkleTree(commitment);
    const lastWithdrawal = await getLastWithdrawBeforeTheTicketWasCreated(
      tickedStored.timestamp
    );
    const lastDeposit = await getLastDepositsBeforeTheTicketWasCreated(
      tickedStored.timestamp
    );

    const pastTime = Date.now();

    const score = +lastWithdrawal + +lastDeposit + pastTime / 3600;

    set({ withdrawScore: score });
  },

  preWithdraw: async (logger: Logger) => {
    const { ticket, prepareWithdraw, note, recipientAddress } = get();
    const { dynamicFee, toRef } = useRelayer.getState();

    try {
      clearTimeout(toRef);

      set({
        generatingProof: true,
        buttonText: "Preparing your withdraw...",
      });

      await prepareWithdraw(
        ticket!.contract,
        dynamicFee.price_token_fee,
        {
          note,
          recipient: recipientAddress,
        },
        logger
      );
      set({
        generatingProof: false,
        buttonText: "Withdraw",
      });
    } catch (error) {
      console.warn(error);
      set({
        generatingProof: false,
        buttonText: "Withdraw",
      });
    }
  },

  validateTicket: debounce(async (rawTicket: string) => {
    const {
      resetForm,
    } = get();

    set({
      validatingTicket: true,
    });

    let ticket = rawTicket;

    if (!rawTicket.includes('.testnet') && !rawTicket.includes('.near')) {
      ticket = Buffer.from(rawTicket, 'hex').toString();
    }

    if (ticket.split("-").length < 4) {
      resetForm(['validatingTicket', 'errorMessage', 'note']);

      set({
        validatingTicket: false,
        errorMessage: "Ticket invalid"
      });

      return;
    }

    const commitment = await getCommitmentByTicket(ticket);

    const ticketStored: TicketStored = await getTicketInTheMerkleTree(
      commitment!
    );

    if (!ticketStored) {
      resetForm(['validatingTicket', 'errorMessage', 'note']);

      set({
        validatingTicket: false,
        errorMessage: "This ticket has not been deposited yet",
      });
      return;
    }

    const wasNullifierSpent = await viewWasNullifierSpent(
      useEnv("VITE_NEAR_NODE_URL"),
      ticket
    );

    if (wasNullifierSpent) {
      resetForm(['validatingTicket', 'errorMessage', 'note']);

      set({
        validatingTicket: false,
        errorMessage: "This ticket is not valid anymore",
      });
      return;
    }

    set({
      ticket: ticketStored,
      note: ticket,
      commitment: commitment,
      errorMessage: "",
      validatingTicket: false,
    });
  }, 500),

  handleNote: (value) => {
    const { validateTicket } = get();

    set({ note: value });

    validateTicket(value);
  },

  handleRecipientAddress: (value: string) => {
    const { checkRelayerFee } = useRelayer.getState();

    set({ recipientAddress: value });

    checkRelayerFee(value);
  },

  cleanupInputs: () => {
    set({ note: "", recipientAddress: "" });
  },

  resetForm: (skip) => {

    if (!skip) {
      useRelayer.setState({
        dynamicFee: baseDynamicFee,
      });

      return set(baseForm);
    }

    useRelayer.setState({
      dynamicFee: baseDynamicFee,
    });

    const form = Object.keys(baseForm)
      .filter((key) => {
        return !skip.includes(key)
      })
      .reduce( (res, key) => (res[key] = baseForm[key], res), {} );

    set(form);
  }
}));
