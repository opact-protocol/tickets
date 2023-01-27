import { getTransactionsAction, getTransactionState } from "@/utils/tools";
import { useEffect, useState } from "react";

interface ActionProps {
  status: string;
  message: string;
  methodName: string;
}

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
        const state = await getTransactionState(transactions[i], accountId);
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
