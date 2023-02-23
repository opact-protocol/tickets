import { viewFunction } from "@/helpers";

export const viewAllCurrencies = (
  rpcUrl: string,
  contract: string,
): Promise<any> => {
  return viewFunction(
    rpcUrl,
    contract,
    'view_all_currencies',
  );
};

export const viewCurrencyContracts = (
  rpcUrl: string,
  contract: string,
): Promise<any> => {
  return viewFunction(
    rpcUrl,
    contract,
    'view_all_currencies',
  );
};
