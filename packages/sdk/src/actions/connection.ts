import { AttachedGas } from '../constants';
import type { Transaction } from '../helpers';
import type { ConnectionType } from '../interfaces';

export const sendTransactionsCallback = async (
  connection: ConnectionType,
  transactions: Transaction[],
): Promise<any> => {
  if (connection.functionCall) {
    return await Promise.all(transactions.map(async ({
      receiverId,
      actions,
    }) => {
      const {
        params: {
          methodName = '',
          args = {},
        } = {}
      } = actions[0] || {};

      return await connection.functionCall({
        args,
        contractId: receiverId,
        methodName: methodName,
        gas: AttachedGas as any,
      });
    }));
  }

  const wallet = await connection.wallet();

  return wallet.signAndSendTransactions({ transactions: transactions as any });
}
