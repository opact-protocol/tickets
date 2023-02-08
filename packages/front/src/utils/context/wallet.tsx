import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
  PropsWithChildren,
} from "react";
import type { AccountView } from "near-api-js/lib/providers/provider";
import { map, distinctUntilChanged } from "rxjs";
import { setupWalletSelector } from "@near-wallet-selector/core";
import type { WalletSelector, AccountState } from "@near-wallet-selector/core";
import { setupNearWallet } from "@near-wallet-selector/near-wallet";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import { useEnv } from "@/hooks/useEnv";

interface WalletContextValue {
  selector: WalletSelector;
  accounts: AccountState[];
  accountId: string | null;
  showModal: boolean;
  signOut: () => Promise<void>;
  toggleModal: () => void;
}

export type Account = AccountView & {
  account_id: string;
};

const WalletContext = React.createContext<WalletContextValue | null>(null);

export const WalletSelectorContextProvider: React.FC<
  PropsWithChildren<Record<any, any>>
> = ({ children }) => {
  const [accountId, setAccountId] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [accounts, setAccounts] = useState<AccountState[]>([]);
  const [selector, setSelector] = useState<WalletSelector | null>(null);

  const toggleModal = () => setShowModal(!showModal);

  const signOut = async () => {
    if (!selector) {
      return;
    }

    const wallet = await selector.wallet();

    wallet.signOut();
  };

  const init = useCallback(async () => {
    const _selector = await setupWalletSelector({
      network: useEnv("VITE_NEAR_NETWORK") || "testnet",
      debug: true,
      modules: [setupNearWallet(), setupMeteorWallet()],
    });

    const state = _selector.store.getState();
    setAccounts(state.accounts);
    setSelector(_selector);
  }, []);

  useEffect(() => {
    init().catch((err) => {
      console.error(err);
      alert("Failed to initialize wallet selector");
    });
  }, [init]);

  useEffect(() => {
    if (!selector) {
      return;
    }

    const subscription = selector.store.observable
      .pipe(
        map(({ accounts }) => accounts),
        distinctUntilChanged()
      )
      .subscribe((nextAccounts) => {
        setAccounts(nextAccounts);
        setShowModal(false);
      });

    return () => subscription.unsubscribe();
  }, [selector]);

  useEffect(() => {
    const newAccount =
      accounts.find((account) => account.active)?.accountId || "";

    setAccountId(newAccount);
  }, [accounts]);

  if (!selector) {
    return null;
  }

  return (
    <WalletContext.Provider
      value={{
        selector,
        accounts,
        accountId,
        showModal,
        signOut,
        toggleModal,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export function useWalletSelector() {
  const context = useContext(WalletContext);

  if (!context) {
    throw new Error(
      "useWalletSelector must be used within a WalletSelectorContextProvider"
    );
  }

  return context;
}
