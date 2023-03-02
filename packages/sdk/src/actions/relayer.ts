import axios from 'axios';
import { getTokenStorage } from './ticket';
import { getTransaction } from '../helpers';
import { sendTransactionsCallback } from './connection';
import type { ConnectionType, PublicArgsInterface, RelayerDataInterface } from '../interfaces';

export const sendWithdraw = async (
  relayer: RelayerDataInterface,
  publicArgs: PublicArgsInterface,
) => {
  const relayerService = axios.create({
    baseURL: relayer.url,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });

  return relayerService.post('/relay', JSON.stringify(publicArgs));
}

export const sendContractWithdraw = async (
  nodeUrl: string,
  contract: string,
  signerId: string,
  receiverId: string,
  publicArgs: PublicArgsInterface,
  connection: ConnectionType,
) => {
  const storages = await checkWithdrawStorages(
    nodeUrl,
    signerId,
    contract,
    receiverId,
  )

  const transactions: any[] = [...storages];

  transactions.push(
    getTransaction(
      signerId,
      contract,
      "withdraw",
      publicArgs,
      "0"
    ),
  );

  return sendTransactionsCallback(
    connection,
    transactions,
  );
}

export const checkWithdrawStorages = async (
  nodeUrl: string,
  contract: string,
  signerId: string,
  receiverId: string,
  relayerId?: string,
): Promise<any[]> => {
  const transactions: any[] = [];

  const receiverStorage = await getTokenStorage(
    nodeUrl,
    contract,
    receiverId,
  );

  if (!receiverStorage || receiverStorage.total < '0.10') {
    transactions.push(
      getTransaction(
        signerId,
        contract,
        'storage_deposit',
        {
          account_id: contract,
          registration_only: true,
        },
      ),
    );
  }

  if (!relayerId) {
    return transactions;
  }

  const relayerStorage = await getTokenStorage(
    nodeUrl,
    contract,
    relayerId,
  );

  if (!relayerStorage || relayerStorage.total < '0.10') {
    transactions.push(
      getTransaction(
        signerId,
        contract,
        'storage_deposit',
        {
          account_id: contract,
          registration_only: true,
        },
      ),
    );
  }

  return transactions;
}
