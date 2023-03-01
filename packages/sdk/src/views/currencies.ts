import { viewFunction } from "@/helpers";
import { Currency } from "..";

export const viewAllCurrencies = (
  rpcUrl: string,
  contract: string,
): Promise<Currency[]> => {
  return viewFunction(
    rpcUrl,
    contract,
    'view_all_currencies',
  );
};

export const viewCurrencyContracts = (
  rpcUrl: string,
  contract: string,
  currency: Currency,
): Promise<any> => {
  return viewFunction(
    rpcUrl,
    contract,
    'view_currency_contracts',
    {
      type: currency.type,
      currency,
    },
  );
};

export const viewIsContractAllowed = (
  rpcUrl: string,
  contract: string,
  accountId: string,
) => {
  return viewFunction(
    rpcUrl,
    contract,
    'view_is_contract_allowed',
    {
      account_id: accountId,
    }
  );
}

export const viewIsAllowlistRootValid = (
  rpcUrl: string,
  contract: string,
  root: string,
) => {
  return viewFunction(
    rpcUrl,
    contract,
    'view_is_allowlist_root_valid',
    {
      root,
    }
  );
}
