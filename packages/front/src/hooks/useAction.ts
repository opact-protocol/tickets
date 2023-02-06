import { getTransactionsAction, getTransactionState } from "@/utils/tools";
import { useEffect, useState } from "react";

interface ActionProps {
  status: string;
  message: string;
  methodName: string;
}

export const useAction = (transactionHashes: string, accountId: string) => {
  const [allowlistAction, setAllowlistAction] = useState<ActionProps>();
  const [depositAction, setDepositAction] = useState<ActionProps>();

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

      if (action.methodName === "deposit") {
        setDepositAction(action);
      } else if (action.methodName === "allowlist") setAllowlistAction(action);
    })();
  }, [accountId]);

  return { allowlistAction, depositAction };
};
