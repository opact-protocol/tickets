import { create } from "zustand";
import { setupWalletSelector } from "@near-wallet-selector/core";
import { setupNearWallet } from "@near-wallet-selector/near-wallet";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { setupSender } from "@near-wallet-selector/sender";
import { setupNightly } from "@near-wallet-selector/nightly";
import { setupWelldoneWallet } from "@near-wallet-selector/welldone-wallet";
import { setupXDEFI } from "@near-wallet-selector/xdefi";
import { setupHereWallet } from "@near-wallet-selector/here-wallet";
import { useEnv } from "@/hooks/useEnv";
import { BN } from "bn.js";
import { providers } from "near-api-js";
import { hycService } from "@/lib";
import { Balance, WalletStore } from "@/interfaces";
import { viewAccountBalance } from "hideyourcash-sdk";

export const useWallet = create<WalletStore>((set, get) => ({
  accountId: "",
  selector: null,
  showWalletModal: false,
  haveBalance: true,

  toggleModal: () => {
    const { showWalletModal } = get();

    set(() => ({ showWalletModal: !showWalletModal }));
  },

  initWallet: async () => {
    const newSelector = await setupWalletSelector({
      network: useEnv("VITE_NEAR_NETWORK"),
      debug: true,
      modules: [
        setupMeteorWallet(),
        setupNearWallet(),
        setupMyNearWallet(),
        setupSender(),
        setupNightly(),
        setupWelldoneWallet(),
        setupXDEFI(),
        setupHereWallet(),
      ],
    });

    const state = newSelector.store.getState();

    const newAccount =
      state?.accounts.find((account) => account.active)?.accountId || "";

    try {
      set(() => ({
        accountId: newAccount,
        selector: newSelector,
      }));
    } catch (e) {
      console.warn(e);

      return "";
    }

    return newAccount;
  },

  signOut: async () => {
    const { selector } = get();

    if (!selector) {
      return;
    }

    const wallet = await selector.wallet();

    try {
      await wallet.signOut();
    } catch (e) {
      console.warn(e);

      return;
    }

    set(() => ({ accountId: "" }));
  },
  sendWhitelist: async (connection, accountId) => {
    await hycService.sendAllowlist(accountId, connection);
  },
  viewBalance: async (
    tokenType: string,
    tokenContract: string,
    tokenValue: number
  ): Promise<void> => {
    const { accountId } = get();

    if (tokenType !== "Near") {
      const accountBalance = await viewAccountBalance(
        useEnv("VITE_NEAR_NODE_URL"),
        tokenContract,
        accountId!
      );

      set({ haveBalance: +accountBalance < tokenValue ? false : true });
      return;
    }

    const provider = new providers.JsonRpcProvider({
      url: useEnv("VITE_NEAR_NODE_URL"),
    });

    const protocolConfig = await provider.experimental_protocolConfig({
      finality: "final",
    });

    const state = (await provider.query({
      finality: "final",
      account_id: accountId,
      request_type: "view_account",
    })) as any;

    const costPerByte = new BN(
      protocolConfig.runtime_config.storage_amount_per_byte
    );
    const stateStaked = new BN(state.storage_usage).mul(costPerByte);
    const staked = new BN(state.locked);
    const totalBalance = new BN(state.amount).add(staked);
    const availableBalance = totalBalance.sub(BN.max(staked, stateStaked));

    const balance = {
      total: totalBalance.toString(),
      stateStaked: stateStaked.toString(),
      staked: staked.toString(),
      available: availableBalance.toString(),
    } as Balance;

    set({ haveBalance: +balance.available < tokenValue ? false : true });
    return;
  },
}));
