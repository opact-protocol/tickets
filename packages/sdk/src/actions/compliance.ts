import { getTransaction } from "@/helpers";
import { WalletSelector } from "@near-wallet-selector/core";

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
