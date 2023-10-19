import Big from "big.js";

/**
 * Helpers: Get Decimals
 *
 * This method is responsible for returning the decimals of a fungible token in BN.
 *
 * @param decimals The number of decimals
 * @returns {Promise<string>}
 */
export function getDecimals(decimals: number | undefined) {
  return Big(10).pow(decimals || 1);
}

/**
 * Helpers: Format Big Number with Decimals
 *
 * This method is responsible for formatting the amount with your decimals and return a human readable amount.
 *
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
