import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
  PropsWithChildren,
} from "react";
import { map, distinctUntilChanged } from "rxjs";
import { setupSender } from "@near-wallet-selector/sender";
import { setupWalletSelector } from "@near-wallet-selector/core";
import { setupNearWallet } from "@near-wallet-selector/near-wallet";
import type { AccountView } from "near-api-js/lib/providers/provider";
import type { WalletSelector, AccountState } from "@near-wallet-selector/core";

interface NearContextValue {
  connection: WalletSelector;
  accounts: AccountState[];
  accountId: string | null;
  showModal: boolean;
  signOut: () => Promise<void>;
  toggleModal: () => void;
}

export type Account = AccountView & {
  account_id: string;
};

const WalletContext = React.createContext<NearContextValue | null>(null);

export const WalletSelectorContextProvider: React.FC<
  PropsWithChildren<Record<any, any>>
> = ({ children }) => {
  const [accountId, setAccountId] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [accounts, setAccounts] = useState<AccountState[]>([]);
  const [connection, setConnection] = useState<WalletSelector | null>(null);

  const toggleModal = () => setShowModal(!showModal);

  const signOut = async () => {
    if (!connection) {
      return;
    }

    const wallet = await connection.wallet();

    wallet.signOut();
  };

  const init = useCallback(async () => {
    const _selector = await setupWalletSelector({
      network: import.meta.env.VITE_NEAR_NETWORK,
      debug: true,
      modules: [
        setupSender({
          iconUrl: "/assets/sender-icon.png",
        }),
        setupNearWallet({
          iconUrl: "/assets/near-wallet-icon.png",
        }),
      ],
    });

    const state = _selector.store.getState();

    setAccounts(state.accounts);
    setConnection(_selector);
  }, []);

  useEffect(() => {
    init().catch((err) => {
      console.error(err);
      alert("Failed to initialize wallet selector");
    });
  }, [init]);

  useEffect(() => {
    if (!connection) {
      return;
    }

    const subscription = connection.store.observable
      .pipe(
        map((state) => state.accounts),
        distinctUntilChanged()
      )
      .subscribe((nextAccounts) => {
        console.log("Accounts Update", nextAccounts);

        setAccounts(nextAccounts);
      });

    return () => subscription.unsubscribe();
  }, [connection]);

  useEffect(() => {
    const newAccount =
      accounts.find((account) => account.active)?.accountId || "";

    setAccountId(newAccount);
  }, [accounts]);

  if (!connection) {
    return null;
  }

  return (
    <WalletContext.Provider
      value={{
        accounts,
        accountId,
        showModal,
        connection,
        signOut,
        toggleModal,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useNearWalletSelector = () => {
  const context = useContext(WalletContext);

  if (!context) {
    throw new Error(
      "useWalletSelector must be used within a WalletSelectorContextProvider"
    );
  }

  return context;
};
