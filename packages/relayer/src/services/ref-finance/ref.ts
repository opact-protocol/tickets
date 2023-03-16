/**
 *
 *
 *
 *
 *
 * This file was copied from the ref-finance source code
 *
 *
 *
 *
 *
 */

import {
  config,
  WRAP_NEAR_CONTRACT_ID,
  getConfig,
} from './constant';
import {
  providers,
  utils,
} from 'near-api-js';

import {
  TokenMetadata,
  RefFiViewFunctionOptions,
} from './types';
import { AccountView } from 'near-api-js/lib/providers/provider';
import { Transaction } from './types';
import { ONE_YOCTO_NEAR, REF_TOKEN_ID, REF_META_DATA } from './constant';

import metaIconDefaults from './metaIcons';
import { viewFunction } from '../near';
import { Env } from '@/interfaces';

const BANANA_ID = 'berryclub.ek.near';
const CHEDDAR_ID = 'token.cheddar.near';
const CUCUMBER_ID = 'farm.berryclub.ek.near';
const HAPI_ID = 'd9c2d319cd7e6177336b0a9c93c21cb48d84fb54.factory.bridge.near';
const WOO_ID = '4691937a7508860f876c9c0a2a617e7d9e945d4b.factory.bridge.near';

export const REPLACE_TOKENS = [
  BANANA_ID,
  CHEDDAR_ID,
  CUCUMBER_ID,
  HAPI_ID,
  WOO_ID,
];

export const refFiViewFunction = async ({
  env,
  contract,
  methodName,
  args,
}: RefFiViewFunctionOptions & { env: Env, contract: string }) => {
  return viewFunction(
    env.RPC_URL,
    contract,
    methodName,
    args,
  )
};

export const ftViewFunction = async (
  env: Env,
  contract: string,
  methodName: string,
  args = {},
) => {
  return viewFunction(
    env.RPC_URL,
    contract,
    methodName,
    args
  );
};

export const getTotalPools = async (
  env: Env,
  contract: string,
) => {
  return refFiViewFunction({
    env,
    contract,
    methodName: 'get_number_of_pools',
  });
};

export const ftGetTokenMetadata = async (
  env: Env,
  id: string
): Promise<TokenMetadata> => {
  if (id === REF_TOKEN_ID) return REF_META_DATA;

  const metadata = await ftViewFunction(
    env,
    id,
    'ft_metadata',
  ).catch(() => {
    //
  });

  if (
    !metadata.icon ||
    id === BANANA_ID ||
    id === CHEDDAR_ID ||
    id === CUCUMBER_ID ||
    id === HAPI_ID ||
    id === WOO_ID ||
    id === WRAP_NEAR_CONTRACT_ID
  ) {
    return {
      ...metadata,
      icon: metaIconDefaults[id],
      id,
    };
  }

  return { ...metadata, id };
};

export const ftGetTokensMetadata = async (
  env: Env, contract: string,
  tokenIds?: string[],
  allTokens?: Record<string, TokenMetadata>
) => {
  const ids = tokenIds || (await getGlobalWhitelist(env, contract));

  const tokensMetadata = await Promise.all(
    ids.map(
      (id: string) =>
        allTokens?.[id] || ftGetTokenMetadata(env, id).catch(() => null)
    )
  );

  return tokensMetadata.reduce((pre, cur, i) => {
    return {
      ...pre,
      [ids[i]]: cur,
    };
  }, {}) as Record<string, TokenMetadata>;
};

export const getGlobalWhitelist = async (
  env: Env,
  contract: string,
): Promise<string[]> => {
  const globalWhitelist = await refFiViewFunction({
    env,
    contract,
    methodName: 'get_whitelisted_tokens',
  });

  return Array.from(new Set(globalWhitelist));
};

export const getUserRegisteredTokens = async (
  env: Env,
  contract: string,
  AccountId?: string
): Promise<string[]> => {
  if (!AccountId) return [];

  return refFiViewFunction({
    env,
    contract,
    methodName: 'get_user_whitelisted_tokens',
    args: { account_id: AccountId },
  });
};

export const getAccountNearBalance = async (accountId: string) => {
  const provider = new providers.JsonRpcProvider({
    url: getConfig().nodeUrl,
  });

  return provider
    .query<AccountView>({
      request_type: 'view_account',
      finality: 'final',
      account_id: accountId,
    })
    .then(data => data.amount);
};

export const nearDepositTransaction = (amount: string) => {
  const transaction: Transaction = {
    receiverId: WRAP_NEAR_CONTRACT_ID,
    functionCalls: [
      {
        methodName: 'near_deposit',
        args: {},
        gas: '50000000000000',
        amount,
      },
    ],
  };

  return transaction;
};

export const nearWithdrawTransaction = (amount: string) => {
  const transaction: Transaction = {
    receiverId: WRAP_NEAR_CONTRACT_ID,
    functionCalls: [
      {
        methodName: 'near_withdraw',
        args: { amount: utils.format.parseNearAmount(amount) },
        amount: ONE_YOCTO_NEAR,
      },
    ],
  };
  return transaction;
};

export const refDCLSwapViewFunction = async ({
  env,
  methodName,
  args,
}: RefFiViewFunctionOptions & { env: Env }) => {
  if (!config.REF_DCL_SWAP_CONTRACT_ID)  {
    //
  }

  return refFiViewFunction({
    env,
    contract: 'config.REF_DCL_SWAP_CONTRACT_ID',
    methodName,
    args,
  })
};

export const DCLSwapGetStorageBalance = (
  env: Env,
  AccountId: string
) => {
  return refDCLSwapViewFunction({
    env,
    methodName: 'storage_balance_of',
    args: { account_id: AccountId },
  });
};
