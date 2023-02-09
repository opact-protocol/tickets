import { connect, keyStores, KeyPair, providers } from "near-api-js";
import type { CodeResult } from "near-api-js/lib/providers/provider";
import { Env, HEADERS } from "./index";
import { Big } from "big.js";

// Payload with all required zk args
interface RelayPayload {
  currency: string;
  quantity: string;
  root: string;
  nullifier_hash: string;
  recipient: string;
  relayer: string;
  fee: string;
  refund: string;
  allowlist_root: string;
  a: any;
  b: any;
  c: any;
  z: any;
  t_1: any;
  t_2: any;
  t_3: any;
  eval_a: string;
  eval_b: string;
  eval_c: string;
  eval_s1: string;
  eval_s2: string;
  eval_zw: string;
  eval_r: string;
  wxi: any;
  wxi_w: any;
}

type RelayResponse =
  | {
      status: "success";
      transaction: string;
    }
  | {
      status: "failure";
      error: any;
    };

export async function handleRelay(
  request: Request,
  env: Env
): Promise<Response> {
  const args: RelayPayload = await request.json();

  // setup NEAR config
  const myKeyStore = new keyStores.InMemoryKeyStore();
  const keyPair = KeyPair.fromString(env.PRIVATE_KEY);
  await myKeyStore.setKey(env.NEAR_NETWORK, env.ACCOUNT_NAME, keyPair);
  const connectionConfig = {
    networkId: env.NEAR_NETWORK,
    keyStore: myKeyStore,
    nodeUrl: env.RPC_URL,
  };
  const nearConnection = await connect(connectionConfig);
  const account = await nearConnection.account(env.ACCOUNT_NAME);

  // check if payload uses correct relayer
  if (args.relayer != env.ACCOUNT_NAME)
    return new Response(
      JSON.stringify({
        status: "failure",
        error: `should specify correct relayer address: ${env.ACCOUNT_NAME}`,
      }),
      { headers: HEADERS }
    );

  // check if payload uses correct fee
  const minimumFee = new Big(args.quantity).mul(new Big(env.RELAYER_FEE));
  const payloadFee = new Big(args.fee);
  if (payloadFee.lt(minimumFee))
    return new Response(
      JSON.stringify({
        status: "failure",
        error: `should at least minimum relayer fee: ${minimumFee.toFixed(0)}`,
      }),
      { headers: HEADERS }
    );

  // check if payload is valid
  try {
    await viewFunction(
      connectionConfig.nodeUrl,
      env.HYC_CONTRACT,
      "view_is_withdraw_valid",
      args
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        status: "failure",
        error,
      }),
      { headers: HEADERS }
    );
  }

  // since payload is valid, submit transaction and return hash
  const transaction = await account.functionCall({
    contractId: env.HYC_CONTRACT,
    methodName: "withdraw",
    args,
    gas: "300000000000000",
  });

  return new Response(
    JSON.stringify({
      status: "success",
      transaction,
    }),
    { headers: HEADERS }
  );
}

async function viewFunction(
  nodeUrl: string,
  contractId: string,
  methodName: string,
  args: any
) {
  const provider = new providers.JsonRpcProvider({ url: nodeUrl });
  const serializedArgs = Buffer.from(JSON.stringify(args)).toString("base64");

  const res = await provider.query<CodeResult>({
    request_type: "call_function",
    account_id: contractId,
    method_name: methodName,
    args_base64: serializedArgs,
    finality: "optimistic",
  });

  return JSON.parse(Buffer.from(res.result).toString());
}
