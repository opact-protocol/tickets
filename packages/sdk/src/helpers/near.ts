import { AttachedGas } from "@/constants";

let _nextId = 123;

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
  console.log(amount);

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
          deposit: '1',
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
  const serializedArgs = Buffer.from(JSON.stringify(args)).toString("base64");

  const params = {
    request_type: "call_function",
    account_id: contractId,
    method_name: methodName,
    args_base64: serializedArgs,
    finality: "optimistic",
  };

  const res = await sendJsonRpc(nodeUrl, 'query', params);

  const {
    result,
  } = await res.json();

  if (result.error) {
    throw new Error(result.error);
  }

  return JSON.parse(Buffer.from(result.result).toString());
};

export const sendJsonRpc = (
  nodeUrl: string,
  method: string,
  params: object,
) => {
  const body = JSON.stringify({
    method,
    params,
    id: (_nextId++),
    jsonrpc: '2.0'
  });

  return fetch(nodeUrl, {
    body,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
}
