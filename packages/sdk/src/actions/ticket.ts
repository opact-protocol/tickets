
import { mimc } from "@/services";
import { viewAccountHash } from "@/views";
import { getTransaction, randomBN } from "@/helpers";
import { WalletSelector } from "@near-wallet-selector/core";

export const createTicket = async (
  nodeRpcUrl: string,
  contract: string,
  accountId: string,
  currencieContract: string,
) => {
  const secret = randomBN();
  const nullifier = randomBN();

  const secrets_hash = mimc.hash!(secret, nullifier);

  const accountHash = await viewAccountHash(
    nodeRpcUrl,
    contract,
    accountId,
  );

  const contractHash = await viewAccountHash(
    nodeRpcUrl,
    contract,
    currencieContract,
  );

  //contract-secret-nullifier-account
  const note = `
    ${contractHash.toString()}-
    ${secret.toString()}-
    ${nullifier.toString()}-
    ${accountHash.toString()}
  `;

  return {
    note,
    hash: secrets_hash,
  };
}

export const sendDeposit = async(
  hash: string,
  amount: string,
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
      "deposit",
      {
        secrets_hash: hash,
      },
      amount
    )
  );

  wallet.signAndSendTransactions({
    transactions,
  });
}
