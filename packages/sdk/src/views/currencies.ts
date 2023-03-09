import { viewFunction } from "../helpers";
import { viewFungibleTokenMetadata } from "./fungible-token";
import type { Currency, ViewCurrenciesResponseInterface } from "../interfaces";

export const viewAllCurrencies = async (
  rpcUrl: string,
  contract: string
): Promise<ViewCurrenciesResponseInterface[]> => {
  const currencies = await viewFunction(
    rpcUrl,
    contract,
    "view_all_currencies"
  );

  return Promise.all(
    currencies.map(async (currency: Currency) => {
      if (currency.type === "Near") {
        return {
          ...currency,
          contract: "Near",
          contracts: await viewCurrencyContracts(rpcUrl, contract, currency),
        };
      }

      return {
        ...currency,
        metadata: await viewFungibleTokenMetadata(rpcUrl, currency.account_id!),
        contracts: await viewCurrencyContracts(rpcUrl, contract, currency),
      };
    })
  );
};

export const viewCurrencyContracts = async (
  rpcUrl: string,
  contract: string,
  currency: Currency
): Promise<any> => {
  return await viewFunction(rpcUrl, contract, "view_currency_contracts", {
    type: currency.type,
    currency,
  });
};

export const viewIsContractAllowed = async (
  rpcUrl: string,
  contract: string,
  accountId: string
) => {
  return await viewFunction(rpcUrl, contract, "view_is_contract_allowed", {
    account_id: accountId,
  });
};

export const viewIsAllowlistRootValid = async (
  rpcUrl: string,
  contract: string,
  root: string
) => {
  return await viewFunction(rpcUrl, contract, "view_is_allowlist_root_valid", {
    root,
  });
};
