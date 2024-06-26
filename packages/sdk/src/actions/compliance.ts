import { getTransaction } from "../helpers";
import type { ConnectionType } from "../interfaces";
import { sendTransactionsCallback } from "./connection";

export const sendAllowlist = async (
  nodeUrl: string,
  contract: string,
  accountId: string,
  connection: ConnectionType
): Promise<any> => {
  const transactions: any[] = [];

  transactions.push(
    getTransaction(
      accountId,
      contract,
      "allowlist",
      {
        account_id: accountId,
      },
      "0.00048"
    )
  );

  return sendTransactionsCallback(connection, transactions);
};
