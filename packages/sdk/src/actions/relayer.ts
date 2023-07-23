import axios from "axios";
import { getTokenStorage } from "./ticket";
import { getTransaction } from "../helpers";
import { sendTransactionsCallback } from "./connection";
import type {
  ConnectionType,
  PublicArgsInterface,
  RelayerDataInterface,
} from "../interfaces";
import { OneNear } from "../constants";

const baseRelayers = {
  test: "https://dev-relayer.hideyourcash.workers.dev",
  prod: "https://prod-relayer.hideyourcash.workers.dev",
  staging: 'https://staging-relayer.hideyourcash.workers.dev',
  local: "http://localhost:8787",
};

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

export const getRandomRelayer = async ({
  network = "test"
}: { network: "test" | "prod" | "local" }): Promise<RelayerDataInterface[]> => {
  const relayerService = axios.create({
    baseURL: baseRelayers[network],
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });

  const { data } = await relayerService.get("/data");

  return [
    {
      url: baseRelayers[network],
      account: data.data.account_id,
      feePercent: data.data.feePercent,
    },
  ];
}
