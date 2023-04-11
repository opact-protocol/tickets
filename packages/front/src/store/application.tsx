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
  nearBalance: 0,
  tokenBalance: 0,

  getAllCurrencies: async () => {
    const currencies = await viewAllCurrencies(
      useEnv("VITE_NEAR_NODE_URL"),
      useEnv("VITE_CONTRACT")
    );

    set({
      allCurrencies: currencies.map((token) => ({
        ...token,
        ...(token.type === "Near" && { icon: "/near_icon.svg" }),
      })),
    });
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

  viewAccountBalance: async () => {
    const { allCurrencies } = get();
    const { viewBalance, viewNearBalance } = useWallet.getState();

    const token = allCurrencies.find((token) => {
      if ("account_id" in token) return token;
    });

    if (!token) return;

    const balance = await viewBalance(token.account_id!);

    const { available } = await viewNearBalance();

    set({ nearBalance: +available, tokenBalance: +balance });
  },
  initApp: async () => {
    const { getAllCurrencies, viewIsInAllowlist, viewAccountBalance } = get();
    const { fetchRelayerData } = useRelayer.getState();
    const { initWallet } = useWallet.getState();

    await initWallet();
    await getAllCurrencies();
    await viewIsInAllowlist();
    await fetchRelayerData();
    await viewAccountBalance();

    set({ appStarted: true });
  },
}));
