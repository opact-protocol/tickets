import { mimc as mimcService } from "../services";
import { viewAccountHash } from "../views";
import { sendTransactionsCallback } from "./connection";
import type { ConnectionType, Currency } from "../interfaces";
import { getTransaction, randomBN, viewFunction } from "../helpers";

export const createTicket = async (
  nodeRpcUrl: string,
  contract: string,
  accountId: string,
  currencyId: string,
  skip = false,
) => {
  const { hash } = await mimcService.initMimc();

  const secret = randomBN();
  const nullifier = randomBN();

  const secretsHash = hash!(secret!, nullifier!);

  const accountHash = await viewAccountHash(nodeRpcUrl, contract, accountId);

  const note =
    currencyId.toString() +
    "-" +
    secret!.toString() +
    "-" +
    nullifier!.toString() +
    "-" +
    accountHash!.toString();

  return {
    note: skip ? note : Buffer.from(note).toString('base64'),
    hash: secretsHash,
  };
};

export const sendDeposit = async (
  nodeUrl: string,
  hash: string,
  amount: string,
  depositContract: string,
  accountId: string,
  currency: Currency,
  connection: ConnectionType
) => {
  const transactions: any[] = [];

  if (currency.type === "Nep141") {
    const tokenContract = currency.account_id || "";

    transactions.push(
      getTransaction(accountId, tokenContract, "ft_transfer_call", {
        amount,
        msg: hash,
        memo: null,
        receiver_id: depositContract,
      })
    );
  }

  if (currency.type === "Near") {
    transactions.push(
      getTransaction(
        accountId,
        depositContract,
        "deposit",
        {
          secrets_hash: hash,
        },
        amount,
        true
      )
    );
  }

  return await sendTransactionsCallback(connection, transactions);
};

export const getTokenStorage = async (
  contract: string,
  accountId: string,
  nodeRpcUrl: string
) => {
  try {
    return await viewFunction(nodeRpcUrl, contract, "storage_balance_of", {
      account_id: accountId,
    });
  } catch (e) {
    console.warn(e);

    return;
  }
};
