import Big from "big.js";
import { Env } from "../interfaces";
import { utils } from "near-api-js";
import jwt from "@tsndr/cloudflare-worker-jwt";
import {
  getTokenStorage,
  viewFunction,
  viewFungibleTokenMetadata,
  viewState,
} from "./near";
import { RouterRequest } from "@tsndr/cloudflare-worker-router";

const errorStatus = 500;
const successStatus = 200;

const coinGeckoTokenMap = {
  near: "near",
} as any;

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
      percentage_fee: string;
      valid_fee_for_ms: number;
      price_token_fee: string;
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

  const { tokenId, depositValue } = await getCurrencyOfInstance(
    params.instanceId,
    env
  );

  const { last: usdNearPrice } = await getTokenDataById(coinGeckoTokenMap.near);

  const nearStoragePrice = await getNearStorageBoundsById(
    params.receiverAccountId,
    tokenId,
    env
  );

  const usdStoragePrice = +usdNearPrice * +nearStoragePrice;

  const {
    last: usdTokenPrice,

    //@ts-ignore
  } = await getTokenDataById(
    coinGeckoTokenMap[tokenId] || ("usd-coin" as string)
  );

  const tokenStoragePrice = +usdTokenPrice * +usdStoragePrice;

  const rawTokenStoragePrice = await formatInteger(
    tokenStoragePrice,
    tokenId,
    env
  );

  const baseFeeForDepositValue = await calculateBaseFee(depositValue, env);

  const rawTokenFee = new Big(rawTokenStoragePrice)
    .add(baseFeeForDepositValue)
    .toFixed(0)
    .toString();

  const humanFee = (
    await getHumanFeePercentage(rawTokenFee, depositValue)
  ).toString();

  const token = await jwt.sign(
    {
      tokenId,
      percentage_fee: humanFee,
      price_token_fee: rawTokenFee,
      currencyContractId: params.instanceId,
      exp: getExpirationTime(),
      reciver_storage:
        nearStoragePrice !== "0" ? params.receiverAccountId : null,
    },
    env.PRIVATE_KEY
  );

  return {
    status: successStatus,
    body: {
      token,
      status: "sucess",
      timestamp: Date.now(),
      valid_fee_for_ms: 120000,
      percentage_fee: humanFee,
      price_token_fee: rawTokenFee,
    },
  };
};

export const getExpirationTime = () => {
  const nowInSeconds = Math.floor(Date.now() / 1000);

  const twoMinutesInSeconds = 120;

  return nowInSeconds + twoMinutesInSeconds;
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
  { RPC_URL }: Env
): Promise<{ depositValue: string; tokenId: string }> => {
  const { currency, deposit_value } = await viewFunction(
    RPC_URL,
    instanceId,
    "view_contract_params"
  );

  return {
    depositValue: deposit_value,
    tokenId: currency.account_id || "near",
  };
};

export const getTokenDataById = async (token: string): Promise<any> => {
  const res = await fetch(`https://api.coingecko.com/api/v3/coins/${token}`);

  const { tickers } = (await res.json()) as any;

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

  if (!currentStorage || currentStorage.total < "0.10") {
    return utils.format.formatNearAmount("2350000000000000000000");
  }

  return "0";
};

export const formatInteger = async (
  amount: string | number,
  contract: string,
  { RPC_URL }: Env
): Promise<string> => {
  const { decimals } = await viewFungibleTokenMetadata(RPC_URL, contract);

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
