import Big from "big.js";

export const formatInteger = (amount: any, decimals: number) => {
  return Big(amount).mul(Big(10).pow(decimals));
};
