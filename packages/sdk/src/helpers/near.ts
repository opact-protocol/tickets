import { AttachedGas } from '@/constants';
import { utils, providers } from 'near-api-js';
import type { CodeResult } from 'near-api-js/lib/providers/provider';

export interface Transaction {
  signerId: string;
  receiverId: string;
  actions: Action[];
}

export interface Action {
  type: string;
  params: Params;
}

export interface Params {
  methodName: string;
  args: any;
  gas: string;
  deposit: string;
}

export const getTransaction = (
  signerId: string,
  receiverId: string,
  method: string,
  args: any,
  amount?: string,
): Transaction => {
  return {
    signerId,
    receiverId,
    actions: [
      {
        type: 'FunctionCall',
        params: {
          methodName: method,
          args,
          gas: AttachedGas,
          deposit: amount ? utils.format.parseNearAmount(amount)! : '1',
        },
      },
    ],
  };
};

export const viewFunction = async (
  nodeUrl: string,
  contractId: string,
  methodName: string,
  args: any = {},
) => {
  const provider = new providers.JsonRpcProvider({ url: nodeUrl });

  const serializedArgs = Buffer.from(JSON.stringify(args)).toString("base64");

  const res = (await provider.query({
    request_type: "call_function",
    account_id: contractId,
    method_name: methodName,
    args_base64: serializedArgs,
    finality: "optimistic",
  })) as any;

  return JSON.parse(Buffer.from(res.result).toString());
};
