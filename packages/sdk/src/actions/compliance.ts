import { getTransaction } from "../helpers";
import type { ConnectionType } from "../interfaces";
import { sendTransactionsCallback } from "./connection";

/**
 * Send an account to allowlist
 * @param nodeUrl The Near RPC to send the transaction
 * @param contract The accountId of registry contract
 * @param accountId The accountId to be send to allowlist
 * @param connection the near connection that will to sign the transactions (Near Account or Wallet Selector)
 * @returns {Promise<any>}
 */
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
      "0.0004"
    )
  );

  return sendTransactionsCallback(connection, transactions);
};
