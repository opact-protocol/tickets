import axios, { AxiosResponse } from "axios";
import { getTokenStorage } from "./ticket";
import { getTransaction } from "../helpers";
import { sendTransactionsCallback } from "./connection";
import type {
  ConnectionType,
  PublicArgsInterface,
  RelayerDataInterface,
} from "../interfaces";
import { OneNear } from "../constants";

/**
 * Relayer Get Relayer Fee
 *
 * This method is responsible for sending a fee request to the relayer.
 *
 * @param relayer The data of relayer with the url to be requested fee
 * @param accountId The near accountId to be calculate fee
 * @param instanceId The instance accountId to be sended withdraw
 * @returns {Promise<AxiosResponse>}
 */
export const getRelayerFee = async (
  relayer: RelayerDataInterface,
  accountId: string,
  instanceId: string
) => {
  return axios({
    url: `${relayer.url}/fee`,
    method: "post",
    data: {
      instanceId,
      receiverAccountId: accountId,
    },
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
};

/**
 * Relayer Send Withdraw
 *
 * This method is responsible for sending a withdraw request to the relayer.
 *
 * @param relayer The data of relayer with the url to be requested fee
 * @param payload The generated withdraw payload to be sended to withdraw
 * @returns {Promise<AxiosResponse>}
 */
export const sendWithdraw = async (
  relayer: RelayerDataInterface,
  payload: { publicArgs: PublicArgsInterface; token: string }
) => {
  return axios({
    url: `${relayer.url}/relay`,
    method: "post",
    data: payload,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
};

/**
 * Relayer Send Contract Withdraw
 *
 * This method is responsible for sending a withdraw transaction to the blockchain. Without using a relayer.
 *
 * @param nodeUrl The Near RPC to send the transaction
 * @param contract The instance accountId to be send on transaction
 * @param signerId The signer accountId of the transaction
 * @param receiverId The receiver accountId of ticket amount
 * @param publicArgs The generated withdraw payload
 * @param connection the near connection that will to sign the transactions (Near Account or Wallet Selector)
 * @returns {Promise<AxiosResponse>}
 */
export const sendContractWithdraw = async (
  nodeUrl: string,
  contract: string,
  signerId: string,
  receiverId: string,
  publicArgs: PublicArgsInterface,
  connection: ConnectionType
) => {
  const storages = await checkWithdrawStorages(
    nodeUrl,
    signerId,
    contract,
    receiverId
  );

  const transactions: any[] = [...storages];

  transactions.push(
    getTransaction(signerId, contract, "withdraw", publicArgs, "0")
  );

  return sendTransactionsCallback(connection, transactions);
};

/**
 * Relayer check withdraw storages
 *
 * This method is responsible for verifying and calculating the storage of Relayer, Sender and Receiver on contract.
 *
 * @param nodeUrl The Near RPC to send the transaction
 * @param contract The contract accountId to be send on transaction
 * @param signerId The signer accountId of the transaction
 * @param receiverId The receiver accountId of ticket amount
 * @param relayerId The relayer accountId to be send the transaction
 * @param connection the near connection that will to sign the transactions (Near Account or Wallet Selector)
 * @returns {Promise<any[]>}
 */
export const checkWithdrawStorages = async (
  nodeUrl: string,
  contract: string,
  signerId: string,
  receiverId: string,
  relayerId?: string
): Promise<any[]> => {
  const transactions: any[] = [];

  const receiverStorage = await getTokenStorage(nodeUrl, contract, receiverId);

  if (!receiverStorage) {
    transactions.push(
      getTransaction(
        signerId,
        contract,
        "storage_deposit",
        {
          account_id: contract,
          registration_only: true,
        },
        OneNear
      )
    );
  }

  if (!relayerId) {
    return transactions;
  }

  const relayerStorage = await getTokenStorage(nodeUrl, contract, relayerId);

  if (!relayerStorage) {
    transactions.push(
      getTransaction(
        signerId,
        contract,
        "storage_deposit",
        {
          account_id: contract,
          registration_only: true,
        },
        OneNear
      )
    );
  }

  return transactions;
};
