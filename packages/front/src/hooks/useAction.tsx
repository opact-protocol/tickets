import { useEffect, useState } from "react";
import { getTransactionsAction } from "@/utils/tools";
import { getTransactionState } from "hideyourcash-sdk";
import { useEnv } from "./useEnv";

interface ActionProps {
  status: string;
  message: string;
  methodName: string;
}

const nodeUrl = useEnv('VITE_NEAR_NODE_URL');

export const useAction = (transactionHashes: string, accountId: string) => {
  const [action, setAction] = useState<ActionProps>();

  useEffect(() => {
    if (!accountId || !transactionHashes) {
      return;
    }

    (async () => {
      const transactions = transactionHashes.split(",");

      const states: any[] = [];

      for (let i = 0; i < transactions.length; i++) {
        const state = await getTransactionState({
          nodeUrl,
          accountId,
          txHash: transactions[i],
        });

        states.push(state);
      }

      const action = getTransactionsAction(states);

      if (!action) {
        return;
      }

      setAction(action);
    })();
  }, [accountId]);

  return { action };
};
