import { useEnv } from "@/hooks/useEnv";
import { AppStore } from "@/interfaces";
import {
  viewAllCurrencies,
  viewIsInAllowlist as isInAllowlist,
} from "hideyourcash-sdk";
import { create } from "zustand";
import { useRelayer } from "./relayer";
import { useWallet } from "./wallet";

export const useApp = create<AppStore>((set, get) => ({
  allCurrencies: [],
  allowlist: false,
  appStarted: false,

  getAllCurrencies: async () => {
    const currencies = await viewAllCurrencies(
      useEnv("VITE_NEAR_NODE_URL"),
      useEnv("VITE_CONTRACT")
    );

    set({ allCurrencies: currencies });
  },
  viewIsInAllowlist: async () => {
    const { accountId } = useWallet.getState();

    if (!accountId) return;

    const result: boolean = await isInAllowlist(
      useEnv("VITE_NEAR_NODE_URL"),
      useEnv("VITE_CONTRACT"),
      accountId
    );

    set({ allowlist: result });
  },
  initApp: async () => {
    const { getAllCurrencies, viewIsInAllowlist } = get();
    const { fetchRelayerData } = useRelayer.getState();

    await getAllCurrencies();
    await viewIsInAllowlist();
    await fetchRelayerData();

    set({ appStarted: true });
  },
}));
