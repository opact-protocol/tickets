import { getTransaction } from "@/helpers";
import { WalletSelector } from "@near-wallet-selector/core";
// import { Account } from "near-api-js";

export const sendAllowlist = async (
  contract: string,
  accountId: string,
  connection: WalletSelector,
) => {
  const wallet = await connection.wallet();

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

  wallet.signAndSendTransactions({
    transactions,
  });
}
