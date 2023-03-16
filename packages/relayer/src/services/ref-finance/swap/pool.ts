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

// @ts-nocheck
/* eslint-disable */

import { getTotalPools, refFiViewFunction } from '../ref';
import { Pool, PoolRPCView } from '../types';
import { parsePool, toNonDivisibleNumber } from '../utils';
import { STABLE_LP_TOKEN_DECIMALS } from '../constant';
import { Env } from '@/interfaces';

let DEFAULT_PAGE_LIMIT = 100;

export const getRatedPoolDetail = async (env: Env, contract: string,{ id }: { id: string | number }) => {
  return refFiViewFunction({
    env,
    contract,
    methodName: 'get_rated_pool',
    args: { pool_id: Number(id) },
  }).then(pool_info => ({
    ...pool_info,
    id: Number(id),
    pool_kind: 'RATED_SWAP',
  }));
};

export const getUnRatedPoolDetail = async (env: Env, contract: string, { id }: { id: string | number }) => {
  return refFiViewFunction({
    env,
    contract,
    methodName: 'get_stable_pool',
    args: { pool_id: Number(id) },
  }).then(pool_info => ({
    ...pool_info,
    id: Number(id),
    pool_kind: 'STABLE_SWAP',
    rates: pool_info.c_amounts.map((_: any) =>
      toNonDivisibleNumber(STABLE_LP_TOKEN_DECIMALS, '1')
    ),
  }));
};

export const getStablePools = async (env: Env, contract: string, stablePools: Pool[]) => {
  return Promise.all(
    stablePools.map(pool =>
      pool.pool_kind === 'RATED_SWAP'
        ? getRatedPoolDetail(env, contract, { id: pool.id })
        : getUnRatedPoolDetail(env, contract, { id: pool.id })
    )
  );
};

export const getPool = async (env: Env, contract: string, id: number): Promise<Pool> => {
  return await refFiViewFunction({
    env,
    contract,
    methodName: 'get_pool',
    args: { pool_id: id },
  }).then((pool: PoolRPCView) => parsePool(pool, id));
};

export const getPoolByIds = async (env: Env, contract: string, ids: number[]): Promise<Pool[]> => {
  return await refFiViewFunction({
    env,
    contract,
    methodName: 'get_pool_by_ids',
    args: { pool_ids: ids },
  }).then((pools: PoolRPCView[]) => pools.map((p, i) => parsePool(p, ids[i])));
};

export const getRefPools = async (
  env: Env, contract: string,
  page = 1,
  perPage: number = DEFAULT_PAGE_LIMIT
): Promise<Pool[]> => {
  const index = (page - 1) * perPage;
  const poolData: PoolRPCView[] = await refFiViewFunction({
    env,
    contract,
    methodName: 'get_pools',
    args: { from_index: index, limit: perPage },
  });

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
