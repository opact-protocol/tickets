import { useEnv } from "@/hooks/useEnv";
import { RelayerStore } from "@/interfaces";
import { hycService } from "@/lib";
import { RelayerDataInterface } from "hideyourcash-sdk";
import { create } from "zustand";

const relayerNetwork = useEnv("VITE_RELAYER_NETWORK");

export const useRelayer = create<RelayerStore>((set) => ({
  relayerData: { account: "", feePercent: "", url: "" },
  relayerJWT: "",

  getRelayerFee: async (
    accountId: string,
    instanceId: string,
    relayer: RelayerDataInterface
  ) => {
    return hycService.getRelayerFee(relayer, accountId, instanceId);
  },

  fetchRelayerData: async () => {
    const data = await hycService.getRandomRelayer(relayerNetwork);

    set({ relayerData: data[0] });
  },
  setRelayerJWT: (value) => {
    set({ relayerJWT: value });
  },
}));
