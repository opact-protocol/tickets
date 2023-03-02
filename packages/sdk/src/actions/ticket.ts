import { mimc as mimcService } from "../services";
import { viewAccountHash } from "../views";
import { sendTransactionsCallback } from "./connection";
import type { ConnectionType, Currency } from "../interfaces";
import { getTransaction, randomBN, viewFunction } from "../helpers";

export const createTicket = async (
  nodeRpcUrl: string,
  contract: string,
  accountId: string,
  currencyId: string
) => {
  const { hash } = await mimcService.initMimc();

  const secret = randomBN();
  const nullifier = randomBN();

  const secretsHash = hash!(secret!, nullifier!);

  const accountHash = await viewAccountHash(nodeRpcUrl, contract, accountId);

  // TODO: check who pass hash and send deposit with hashed value
  // const currencyHash = await viewAccountHash(
  //   nodeRpcUrl,
  //   contract,
  //   currencyId,
  // );

  const note =
    currencyId.toString() +
    "-" +
    secret!.toString() +
    "-" +
    nullifier!.toString() +
    "-" +
    accountHash!.toString();

  return {
    note,
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

    const storage = await getTokenStorage(
      tokenContract,
      depositContract,
      nodeUrl
    );

    if (!storage || storage.total < "0.10") {
      transactions.push(
        getTransaction(
          accountId,
          tokenContract,
          "storage_deposit",
          {
            account_id: depositContract,
            registration_only: true,
          },
          "0.50"
        )
      );
    }

    const signerStorage = await getTokenStorage(
      accountId,
      depositContract,
      nodeUrl
    );

    if (!signerStorage || signerStorage.total < "0.10") {
      transactions.push(
        getTransaction(
          accountId,
          tokenContract,
          "storage_deposit",
          {
            account_id: accountId,
            registration_only: true,
          },
          "0.50"
        )
      );
    }

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
  token: string,
  contract: string,
  nodeRpcUrl: string
) => {
  try {
    return await viewFunction(nodeRpcUrl, token, "storage_balance_of", {
      account_id: contract,
    });
  } catch (e) {
    return;
  }
};
