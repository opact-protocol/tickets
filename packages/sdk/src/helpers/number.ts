import Big from "big.js";

/**
 * Get Decimals
 * @param decimals The number of decimals
 * @returns {Promise<string>}
 */
export function getDecimals(decimals: number | undefined) {
  return Big(10).pow(decimals || 1);
}

/**
 * Format Big Number with Decimals
 * @param value The raw value with decimals
 * @param decimals The number of decimals
 * @returns {Promise<string>}
 */
export const formatBigNumberWithDecimals = (
  value: string | number | Big,
  decimals: Big
) => {
  return new Big(value).div(decimals).toFixed(2);
};
