import Big from "big.js";
import { Env } from "../interfaces";
import { utils } from "near-api-js";
import jwt from "@tsndr/cloudflare-worker-jwt";
import {
  getTokenStorage,
  viewFunction,
  viewState,
} from "./near";
import { RouterRequest } from "@tsndr/cloudflare-worker-router";
import { estimateSwap, EstimateSwapView, fetchAllPools, ftGetTokenMetadata, getConfig } from "./ref-finance";

const errorStatus = 500;
const successStatus = 200;

export type CurrencyType =
  | {
      type: "Near";
    }
  | {
      type: "Nep141";
      account_id: string;
    };

export type CalculateFeeBodyResponseType =
  | {
      status: "failure";
      error: string;
    }
  | {
      token: string;
      status: "sucess";
      timestamp: number;
      network_fee: string;
      percentage_fee: string;
      price_token_fee: string;
      valid_fee_for_ms: number;
      human_network_fee: string;
      user_will_receive: string;
      formatted_token_fee: string;
      formatted_user_will_receive: string;
    };

export interface RequestParamsInterface {
  instanceId: string;
  receiverAccountId: string;
}

export interface CalculateFeeRequestInterface extends RouterRequest {
  body: RequestParamsInterface;
}

export interface CalculateFeeResponseInterface {
  status: number;
  body: CalculateFeeBodyResponseType;
}

export const calculateFee = async (
  request: RouterRequest & { body: CalculateFeeRequestInterface },
  env: Env
): Promise<CalculateFeeResponseInterface> => {
  const params = request.body;

  const requestIsValid = await validateFeeRequest(params, env);

  if (!requestIsValid) {
    return {
      status: errorStatus,
      body: {
        status: "failure",
        error: "Error to validate your params",
      },
    };
  }

  const refConfig = getConfig(env.NEAR_NETWORK);

  const { simplePools } = await fetchAllPools(env, refConfig.REF_FI_CONTRACT_ID);

  const tokenIn = await ftGetTokenMetadata(
    env,
    env.NEAR_NETWORK === 'testnet' ? 'wrap.testnet' : 'wrap.near',
  );

  const {
    tokenId,
    networkFee,
    depositValue,
  } = await getCurrencyOfInstance(
    params.instanceId,
    env
  );

  const tokenOut = await ftGetTokenMetadata(
    env,
    env.NEAR_NETWORK === 'testnet'
      ? tokenId.includes('wrap')
        ? tokenId
        : 'nusdt.ft-fin.testnet'
      : tokenId ,
  );

  const nearStoragePrice = await getNearStorageBoundsById(
    params.receiverAccountId,
    tokenId,
    env
  );

  const [ swapTodo ]: EstimateSwapView[] = await estimateSwap({
    env,
    tokenIn,
    tokenOut,
    simplePools,
    amountIn: nearStoragePrice,
    contract: refConfig.REF_FI_CONTRACT_ID,
  });

  const tokenStoragePrice = swapTodo.estimate;

  const tokenMetadata = await viewFungibleTokenMetadata(env.RPC_URL, tokenId);

  const rawTokenStoragePrice = await formatInteger(
    tokenStoragePrice,
    tokenOut.decimals
  );

  const baseFeeForDepositValue = await calculateBaseFee(depositValue, env);

  const rawTokenFee = new Big(rawTokenStoragePrice)
    .add(baseFeeForDepositValue)
    .toFixed(0);

  const formattedTokenFee = getHumanFormat(rawTokenFee, tokenOut);

  const humanFee = (
    await getHumanFeePercentage(rawTokenFee.toString(), depositValue)
  ).toString();

  const userWillReceive = new Big(depositValue)
    .sub(rawTokenFee)
    .sub(networkFee)
    .toFixed(0);

  const formattedUserWillReceive = getHumanFormat(
    userWillReceive,
    tokenOut
  );

  const humanNetworkFee = getHumanFormat(networkFee, tokenOut);

  const token = await jwt.sign(
    {
      tokenId,
      percentage_fee: humanFee,
      price_token_fee: rawTokenFee.toString(),
      currencyContractId: params.instanceId,
      exp: getExpirationTime(30),
      receiver_storage:
        nearStoragePrice !== "0" ? params.receiverAccountId : null,
    },
    env.PRIVATE_KEY,
  );

  return {
    status: successStatus,
    body: {
      token,
      status: "sucess",
      timestamp: Date.now(),
      valid_fee_for_ms: 300000,
      percentage_fee: humanFee,
      network_fee: networkFee,
      human_network_fee: humanNetworkFee,
      price_token_fee: rawTokenFee,
      user_will_receive: userWillReceive,
      formatted_token_fee: formattedTokenFee,
      formatted_user_will_receive: formattedUserWillReceive,
    },
  };
};

export const getExpirationTime = (min: number) => {
  const nowInSeconds = Math.floor(Date.now() / 1000);

  const expTime = min * 60;

  return nowInSeconds + expTime;
};

export const validateFeeRequest = async (
  { instanceId, receiverAccountId }: RequestParamsInterface,
  { RPC_URL, HYC_CONTRACT }: Env
): Promise<boolean> => {
  const instanceIsAllowed = await viewFunction(
    RPC_URL,
    HYC_CONTRACT,
    "view_is_contract_allowed",
    {
      account_id: instanceId,
    }
  );

  const isValidReceiverAccountId = await checkIsValidAccountId(
    receiverAccountId,
    RPC_URL
  );

  return instanceIsAllowed && isValidReceiverAccountId;
};

export const getHumanFormat = (
  value: string,
  { symbol, decimals }: { symbol: string; decimals: number }
): string => {
  const bigDecimals = new Big(10).pow(decimals);

  const bigValue = new Big(value);

  return `${bigValue.div(bigDecimals).toFixed(2)} ${symbol.replace('w', '')}`;
};

/**
 *
 * @param accountId
 * @returns
 */
export const checkIsValidAccountId = async (
  accountId: string,
  RPC_URL: string
) => {
  const regExpCheck =
    /^(([a-z\d]+[\-_])*[a-z\d]+\.)*([a-z\d]+[\-_])*[a-z\d]+$/.test(accountId);

  const checkLength = accountId.length > 2 && accountId.length <= 64;

  const isRegisteredAccount = await checkIsRegisteredAccountId(
    accountId,
    RPC_URL
  );

  return regExpCheck && checkLength && isRegisteredAccount;
};

export const checkIsRegisteredAccountId = async (
  accountId: string,
  RPC_URL: string
): Promise<boolean> => {
  const isNammedAccount = accountId.includes(".");

  if (!isNammedAccount) {
    return true;
  }

  try {
    await viewState(RPC_URL, accountId);

    return true;
  } catch (e) {
    return false;
  }
};

export const getCurrencyOfInstance = async (
  instanceId: string,
  { RPC_URL, NEAR_NETWORK }: Env
): Promise<{ depositValue: string; tokenId: string; networkFee: string }> => {
  const { currency, deposit_value, protocol_fee } = await viewFunction(
    RPC_URL,
    instanceId,
    "view_contract_params"
  );

  const tokenId = currency.type === 'Near'
    ? NEAR_NETWORK === 'testnet'
      ? 'wrap.testnet'
      : 'wrap.near'
    : currency.account_id;

  return {
    tokenId,
    networkFee: protocol_fee,
    depositValue: deposit_value,
  };
};

export const getTokenDataById = async (token: string): Promise<any> => {
  const res = await fetch(`https://api.coingecko.com/api/v3/coins/${token}`);

  const { tickers } = (await res.json()) as any;

  if (!tickers) {
    throw new Error(`Tickers for token ${token} is not valid`);
  }

  return tickers.find(({ target }: { target: string }) => target === "USD");
};

export const getNearStorageBoundsById = async (
  receiverId: string,
  currencyId: string,
  env: Env
): Promise<string> => {
  const currentStorage = await getTokenStorage(
    currencyId,
    receiverId,
    env.RPC_URL
  );

  if (!currentStorage) {
    const { min } = await viewFunction(
      env.RPC_URL,
      currencyId,
      'storage_balance_bounds',
    );

    return utils.format.formatNearAmount(min);
  }

  return "0.000000000000000000000001";
};

export const formatInteger = async (
  amount: string | number,
  decimals: number
): Promise<string> => {
  return Big(String(amount)).mul(Big(10).pow(decimals)).toFixed(0);
};

export const calculateBaseFee = async (
  depositValue: string,
  { RELAYER_FEE }: Env
): Promise<Big> => {
  return new Big(depositValue).mul(RELAYER_FEE);
};

export const getHumanFeePercentage = async (
  rawTokenFee: string,
  depositValue: string
): Promise<Big> => {
  const bigDepositValue = new Big(depositValue);

  return new Big(rawTokenFee).mul("100").div(bigDepositValue).div("100");
};
