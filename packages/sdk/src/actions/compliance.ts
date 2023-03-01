import { getTransaction } from "@/helpers";
import { ConnectionType } from "@/interfaces";
import { sendTransactionsCallback } from "./connection";

export const sendAllowlist = async (
  contract: string,
  accountId: string,
  connection: ConnectionType,
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
    )
  );

  return sendTransactionsCallback(
    connection,
    transactions,
  );
}
