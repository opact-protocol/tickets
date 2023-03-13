import { create } from "zustand";
import { useEnv } from "@/hooks/useEnv";
import { ToastCustom } from "@/components/shared/toast-custom";
import { toast } from "react-toastify";
import { Currency, HideyourCash, RelayerDataInterface } from "hideyourcash-sdk";
import { AxiosError } from "axios";

const hycTransaction = "hyc-transaction";
const CONTRACT = useEnv("VITE_CONTRACT");

const appService = new HideyourCash(
  useEnv("VITE_NEAR_NETWORK"),
  useEnv("VITE_NEAR_NODE_URL"),
  CONTRACT,
  useEnv("VITE_API_GRAPHQL_URL"),
  "./verifier.wasm",
  "./circuit.zkey"
);

export const useApplication = create<{
  publicArgs: any;
  hash: any;
  note: any;
  relayerData: any;
  relayerJWT: string;
  setRelayerJWT: (token: string) => any;
  getRelayerFee: (
    accountId: string,
    instanceId: string,
    relayer: RelayerDataInterface
  ) => Promise<any>;
  sendDeposit: (
    amount: string,
    contract: string,
    accountId: string,
    currency: Currency,
    connection: any
  ) => Promise<void>;
  fetchRelayerData: () => Promise<void>;
  sendWithdraw: () => Promise<void>;
  prepareWithdraw: (
    currencyContract: string,
    fee: string,
    payload: { note: string; recipient: string }
  ) => Promise<void>;
  prepareDeposit: (
    account: string,
    currencieContract: string
  ) => Promise<string>;
  sendWhitelist: (connection: any, account: string) => Promise<any>;
}>((set, get) => ({
  publicArgs: null,
  hash: null,
  note: null,
  relayerData: null,
  relayerJWT: "",

  prepareDeposit: async (account: string, currencieContract: string) => {
    const { hash, note } = await appService.createTicket(
      account,
      currencieContract
    );

    set({
      hash,
      note,
    });

    return hash;
  },

  sendDeposit: async (
    amount: string,
    depositContract: string,
    accountId: string,
    currency: Currency,
    connection: any
  ) => {
    appService.sendDeposit(
      get().hash,
      amount,
      depositContract,
      accountId,
      currency,
      connection
    );
    localStorage.removeItem(hycTransaction);
  },

  fetchRelayerData: async () => {
    const data = await appService.getRandomRelayer("local");

    set({ relayerData: data[0] });
  },

  prepareWithdraw: async (
    currencyContract: string,
    fee: string,
    { note, recipient }
  ) => {
    const { relayerData } = get();

    try {
      const publicArgs = await appService.prepareWithdraw(
        fee,
        note,
        relayerData,
        recipient,
        currencyContract
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

  setRelayerJWT: (value) => {
    set({ relayerJWT: value });
  },

  sendWithdraw: async () => {
    const { publicArgs, relayerData, relayerJWT } = get();

    try {
      await appService.sendWithdraw(relayerData, {
        publicArgs,
        token: relayerJWT,
      });
      toast(
        <ToastCustom
          icon="/check-circle-icon.svg"
          title="Withdraw sent"
          message="The funds has been withdraw to the address."
        />,
        {
          toastId: "withdraw-toast",
        }
      );
    } catch (error) {
      console.log(error);
      if (error instanceof AxiosError) {
        toast(
          <ToastCustom
            icon="/error-circle-icon.svg"
            title="Failure"
            message={error.response?.data.error}
          />,
          {
            toastId: "withdraw-toast",
          }
        );
      }
    }
  },
  sendWhitelist: async (connection, accountId) => {
    appService.sendAllowlist(accountId, connection);
  },
  getRelayerFee: async (
    accountId: string,
    instanceId: string,
    relayer: RelayerDataInterface
  ) => {
    return appService.getRelayerFee(relayer, accountId, instanceId);
  },
}));
