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

import {
  Pool,
  PoolRPCView,
  StablePool,
  SmartRoutingInputPool,
  Transaction,
  EstimateSwapView,
} from './types';

import {
  FEE_DIVISOR,
  RATED_POOL_LP_TOKEN_DECIMALS,
  STABLE_LP_TOKEN_DECIMALS,
} from './constant';

import {
  utils,
} from 'near-api-js';

import _ from 'lodash';

import BN from 'bn.js';

import * as math from 'mathjs';

import {
  WRAP_NEAR_CONTRACT_ID,
  STORAGE_TO_REGISTER_WITH_MFT,
} from './constant';
import Big from 'big.js';
import { TokenMetadata } from './types';
import { PoolMode } from './swap/swap';
import { getSwappedAmount } from './stable-swap';
import { CONSTANT_D, POINTLEFTRANGE, POINTRIGHTRANGE } from './constant';

export const DCL_POOL_FEE_LIST = [100, 400, 2000, 10000];

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

export const poolFormatter = (pool: Pool) => {
  return {
    id: pool.id,
    token1Id: pool.tokenIds[0],
    token2Id: pool.tokenIds[1],
    token1Supply: pool.supplies[pool.tokenIds[0]],
    token2Supply: pool.supplies[pool.tokenIds[1]],
    fee: pool.fee,
    shares: pool.shareSupply,
    token0_price: pool.token0_ref_price || '0',
  } as SmartRoutingInputPool;
};

export const isStablePoolToken = (
  stablePools: StablePool[],
  tokenId: string | number
) => {
  return stablePools
    .map(p => p.token_account_ids)
    .flat()
    .includes(tokenId.toString());
};

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

export const round = (decimals: number, minAmountOut: string) => {
  return Number.isInteger(Number(minAmountOut))
    ? minAmountOut
    : Math.ceil(
        Math.round(Number(minAmountOut) * Math.pow(10, decimals)) /
          Math.pow(10, decimals)
      ).toString();
};

export const ONLY_ZEROS = /^0*\.?0*$/;

export const toReadableNumber = (
  decimals: number,
  number: '0'
): string => {
  if (!decimals) return number;

  const wholeStr = number.substring(0, number.length - decimals) || '0';
  const fractionStr = number
    .substring(number.length - decimals)
    .padStart(decimals, '0')
    .substring(0, decimals);

  return `${wholeStr}.${fractionStr}`.replace(/\.?0+$/, '');
};

export const toNonDivisibleNumber = (
  decimals: number,
  number: string
): string => {
  if (decimals === null || decimals === undefined) return number;
  const [wholePart, fracPart = ''] = number.split('.');

  return `${wholePart}${fracPart.padEnd(decimals, '0').slice(0, decimals)}`
    .replace(/^0+/, '')
    .padStart(1, '0');
};

export const scientificNotationToString = (strParam: string) => {
  let flag = /e/.test(strParam);
  if (!flag || !strParam) return strParam;

  let sysbol = true;
  if (/e-/.test(strParam)) {
    sysbol = false;
  }

  const negative = Number(strParam) < 0 ? '-' : '';

  let index = Number(strParam.match(/\d+$/)?.[0]);

  let basis = strParam.match(/[\d\.]+/)?.[0];

  if (!index || !basis) return strParam;

  const ifFraction = basis.includes('.');

  let wholeStr;
  let fractionStr;

  if (ifFraction) {
    wholeStr = basis.split('.')[0];
    fractionStr = basis.split('.')[1];
  } else {
    wholeStr = basis;
    fractionStr = '';
  }

  if (sysbol) {
    if (!ifFraction) {
      return negative + wholeStr.padEnd(index + wholeStr.length, '0');
    } else {
      if (fractionStr.length <= index) {
        return negative + wholeStr + fractionStr.padEnd(index, '0');
      } else {
        return (
          negative +
          wholeStr +
          fractionStr.substring(0, index) +
          '.' +
          fractionStr.substring(index)
        );
      }
    }
  } else {
    if (!ifFraction)
      return (
        negative +
        wholeStr.padStart(index + wholeStr.length, '0').replace(/^0/, '0.')
      );
    else {
      return (
        negative +
        wholeStr.padStart(index + wholeStr.length, '0').replace(/^0/, '0.') +
        fractionStr
      );
    }
  }
};

export const formatWithCommas = (value: string) => {
  const pattern = /(-?\d+)(\d{3})/;
  while (pattern.test(value)) {
    value = value.replace(pattern, '$1,$2');
  }
  return value;
};

export const toPrecision = (
  number: string,
  precision: number,
  withCommas: boolean = false,
  atLeastOne: boolean = true
): string => {
  const [whole, decimal = ''] = number.split('.');

  let str = `${withCommas ? formatWithCommas(whole) : whole}.${decimal.slice(
    0,
    precision
  )}`.replace(/\.$/, '');
  if (atLeastOne && Number(str) === 0 && str.length > 1) {
    var n = str.lastIndexOf('0');
    str = str.slice(0, n) + str.slice(n).replace('0', '1');
  }

  return str;
};

export const percent = (numerator: string, denominator: string) => {
  return math.evaluate(`(${numerator} / ${denominator}) * 100`);
};

export function divide(numerator: string, denominator: string) {
  return math.format(math.evaluate(`${numerator} / ${denominator}`), {
    notation: 'fixed',
  });
}
