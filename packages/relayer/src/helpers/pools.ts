import { TokenMetadata, Pool, StablePool, EstimateSwapView, Env, PoolRPCView } from '@/interfaces';

import {
  toPrecision,
  getSwappedAmount,
  toReadableNumber,
  toNonDivisibleNumber,
  scientificNotationToString,
} from '@/helpers';

import { viewFunction } from '../services/near';

import {
  STABLE_LP_TOKEN_DECIMALS,
  RATED_POOL_LP_TOKEN_DECIMALS,
} from '@/constants';

import Big from 'big.js';

import maxBy from 'lodash/maxBy';

import { FEE_DIVISOR } from '@/constants';

export enum PoolMode {
  PARALLEL = 'parallel swap',
  SMART = 'smart routing',
  SMART_V2 = 'stableSmart',
  STABLE = 'stable swap',
}

export interface SwapParams {
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  amountIn: string;
  simplePools: Pool[];
  options?: SwapOptions;
}

export interface SwapOptions {
  enableSmartRouting?: boolean;
  stablePools?: Pool[];
  stablePoolsDetail?: StablePool[];
}

let DEFAULT_PAGE_LIMIT = 100;

export const getSimplePoolEstimate = ({
  tokenIn,
  tokenOut,
  pool,
  amountIn,
}: {
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  pool: Pool;
  amountIn: string;
}) => {
  const amount_with_fee = Number(amountIn) * (FEE_DIVISOR - pool.fee);
  const in_balance = toReadableNumber(
    tokenIn.decimals,
    pool.supplies[tokenIn.id] as any
  );
  const out_balance = toReadableNumber(
    tokenOut.decimals,
    pool.supplies[tokenOut.id] as any
  );
  const estimate = new Big(
    (
      (amount_with_fee * Number(out_balance)) /
      (FEE_DIVISOR * Number(in_balance) + amount_with_fee)
    ).toString()
  ).toFixed();

  return {
    estimate,
    pool,
    outputToken: tokenOut.id,
    inputToken: tokenIn.id,
  };
};

export const getStablePoolEstimate = ({
  tokenIn,
  tokenOut,
  amountIn,
  stablePool,
}: {
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  amountIn: string;
  stablePool: StablePool;
  pool?: Pool;
}) => {
  const STABLE_LP_TOKEN_DECIMALS = getStablePoolDecimal(stablePool);

  const [amount_swapped, _, dy] = getSwappedAmount(
    tokenIn.id,
    tokenOut.id,
    amountIn,
    stablePool,
    STABLE_LP_TOKEN_DECIMALS
  );

  const amountOut =
    amount_swapped < 0 || isNaN(amount_swapped)
      ? '0'
      : toPrecision(scientificNotationToString(amount_swapped.toString()), 0);

  const dyOut =
    amount_swapped < 0 || isNaN(amount_swapped) || isNaN(dy)
      ? '0'
      : toPrecision(scientificNotationToString(dy.toString()), 0);

  const rates = stablePool.rates.reduce((acc, cur, i) => {
    return {
      ...acc,
      [stablePool.token_account_ids[i]]: cur,
    };
  }, {});

  return {
    estimate: toReadableNumber(STABLE_LP_TOKEN_DECIMALS, amountOut),
    noFeeAmountOut: toReadableNumber(STABLE_LP_TOKEN_DECIMALS, dyOut),
    pool: {
      ...stablePool,
      rates,
    },
    outputToken: tokenOut.id,
    inputToken: tokenIn.id,
  };
};

/**
 * @description Get the estimate of the amount of tokenOut that can be received
 *
 */
export const singlePoolSwap = ({
  tokenIn,
  tokenOut,
  simplePools,
  amountIn,
  stablePools,
}: {
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  simplePools: Pool[];
  amountIn: string;
  stablePools?: StablePool[];
}) => {
  if (!simplePools || simplePools.length === 0) {
    //
  }

  const parsedAmountIn = toNonDivisibleNumber(tokenIn.decimals, amountIn);

  // const pools = simplePools.concat(stablePools);

  const simplePoolsThisPair = simplePools.filter(
    p =>
      p.tokenIds.includes(tokenIn.id) &&
      p.tokenIds.includes(tokenOut.id) &&
      (!stablePools || !isStablePool(stablePools, p.id))
  );

  const estimatesSimplePool = simplePoolsThisPair.map(pool =>
    getSimplePoolEstimate({
      tokenIn,
      tokenOut,
      pool,
      amountIn,
    })
  );

  const stablePoolThisPair = stablePools?.filter(
    sp =>
      sp.token_account_ids.includes(tokenIn.id) &&
      sp.token_account_ids.includes(tokenOut.id)
  );

  // different stable lp token decimal for different type of pools
  const estimatesStablePool = stablePoolThisPair?.map(stablePool => {
    return getStablePoolEstimate({
      tokenIn,
      tokenOut,
      amountIn,
      stablePool,
      pool: simplePools.find(p => p.id === stablePool.id) as Pool,
    });
  });

  const maxSimplePoolEstimate =
    estimatesSimplePool === undefined || estimatesSimplePool.length === 0
      ? undefined
      : estimatesSimplePool.length === 1
      ? estimatesSimplePool[0]
      : maxBy(estimatesSimplePool, estimate => Number(estimate.estimate));

  const maxStablePoolEstimate =
    estimatesStablePool === undefined || estimatesStablePool.length === 0
      ? undefined
      : estimatesStablePool.length === 1
      ? estimatesStablePool[0]
      : maxBy(estimatesStablePool, estimate => Number(estimate.estimate));

  if (!maxStablePoolEstimate && !maxSimplePoolEstimate) {
    //
  }

  maxSimplePoolEstimate &&
    (maxSimplePoolEstimate.pool.partialAmountIn = parsedAmountIn);

  maxStablePoolEstimate &&
    (maxStablePoolEstimate.pool.partialAmountIn = parsedAmountIn);

  if (!maxStablePoolEstimate) {
    maxSimplePoolEstimate &&
      (maxSimplePoolEstimate.pool.partialAmountIn = parsedAmountIn);

    return maxSimplePoolEstimate;
  } else if (!maxSimplePoolEstimate) {
    return maxStablePoolEstimate;
  } else {
    return Number(maxSimplePoolEstimate?.estimate) >
      Number(maxStablePoolEstimate?.estimate)
      ? maxSimplePoolEstimate
      : maxStablePoolEstimate;
  }
};

// simple pools and stable pools for this pair
export const estimateSwap = async ({
  tokenIn,
  tokenOut,
  amountIn,
  simplePools,
  options,
}: SwapParams & { env: Env, contract: string }) => {
  const { stablePoolsDetail } = options || {};

  const parsedAmountIn = toNonDivisibleNumber(tokenIn.decimals, amountIn);

  let singleRouteEstimate: EstimateSwapView[] = [];

  try {
    const estimate = singlePoolSwap({
      tokenIn,
      tokenOut,
      simplePools,
      amountIn,
      stablePools: stablePoolsDetail,
    });

    singleRouteEstimate = [
      {
        ...estimate,
        status: PoolMode.PARALLEL,
        pool: { ...estimate?.pool, partialAmountIn: parsedAmountIn },
        totalInputAmount: toNonDivisibleNumber(tokenIn.decimals, amountIn),
        tokens: [tokenIn, tokenOut],
      },
    ] as EstimateSwapView[];

      return singleRouteEstimate;
  } catch (error) {
    throw new Error();
  }
};

export const parsePool = (pool: PoolRPCView, id?: number): Pool => ({
  id: Number(typeof id === 'number' ? id : pool.id),
  tokenIds: pool.token_account_ids,
  supplies: pool.amounts.reduce(
    (acc: { [tokenId: string]: string }, amount: string, i: number) => {
      acc[pool.token_account_ids[i]] = amount;
      return acc;
    },
    {}
  ),
  fee: pool.total_fee,
  shareSupply: pool.shares_total_supply,
  tvl: pool.tvl,
  token0_ref_price: pool.token0_ref_price,
  pool_kind: pool.pool_kind,
});

export const isStablePool = (
  stablePools: StablePool[],
  poolId: string | number
) => {
  return stablePools.map(p => p.id.toString()).includes(poolId.toString());
};

export const getStablePoolDecimal = (stablePool: StablePool) => {
  return stablePool.pool_kind === 'RATED_SWAP'
    ? RATED_POOL_LP_TOKEN_DECIMALS
    : STABLE_LP_TOKEN_DECIMALS;
};

export const getTotalPools = async (
  env: Env,
  contract: string,
) => {
  return viewFunction(
    env.RPC_URL,
    contract,
    'get_number_of_pools',
  );
};

export const getRefPools = async (
  env: Env, contract: string,
  page = 1,
  perPage: number = DEFAULT_PAGE_LIMIT
): Promise<Pool[]> => {
  const index = (page - 1) * perPage;

  const poolData: PoolRPCView[] = await viewFunction(
    env.RPC_URL,
    contract,
    'get_pools',
    { from_index: index, limit: perPage },
  );

  return poolData.map((rawPool, i) => parsePool(rawPool, i + index));
};

export const fetchAllPools = async (env: Env, contract: string, perPage?: number) => {
  if (perPage) {
    DEFAULT_PAGE_LIMIT = Math.min(perPage, 500);
  }
  const totalPools = await getTotalPools(env, contract);
  const pages = Math.ceil(totalPools / DEFAULT_PAGE_LIMIT);

  const pools = (
    await Promise.all(
      [...Array(pages)].fill(0).map((_, i) => getRefPools(env, contract, i + 1))
    )
  ).flat() as Pool[];

  return {
    simplePools: pools.filter(
      p => p.pool_kind && p.pool_kind === 'SIMPLE_POOL'
    ),
    unRatedPools: pools.filter(
      p => p.pool_kind && p.pool_kind === 'STABLE_SWAP'
    ),
    ratedPools: pools.filter(p => p.pool_kind && p.pool_kind === 'RATED_SWAP'),
  };
};
