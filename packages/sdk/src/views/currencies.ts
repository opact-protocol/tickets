import { viewFunction } from "../helpers";
import { viewFungibleTokenMetadata } from "./fungible-token";
import type { Currency, ViewCurrenciesResponseInterface } from "../interfaces";

/**
 * View All Currencies
 *
 * This View Function returns all currencies included on registry contract
 *
 * @param rpcUrl The Current Near RPC Url
 * @param contract The HYC registry contract accountId
 * @returns {Promise<any>}
 */
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

/**
 * View Currency Contracts
 *
 * This View Function returns all instances of an currency
 *
 * @param rpcUrl The Current Near RPC Url
 * @param contract The contract accountId to be sent on view function
 * @param currency The currency accountId to get instances
 * @returns {Promise<any>}
 */
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

/**
 * View Is Contract Allowed
 *
 * This View Function returns if instanceId is allowed on HYC registry.
 *
 * @param rpcUrl The Current Near RPC Url
 * @param contract The contract accountId to be sent on view function
 * @param accountId The instance accountId to check if is allowed
 * @returns {Promise<any>}
 */
export const viewIsContractAllowed = async (
  rpcUrl: string,
  contract: string,
  accountId: string
) => {
  return await viewFunction(rpcUrl, contract, "view_is_contract_allowed", {
    account_id: accountId,
  });
};

/**
 * View is Allowlist Root Valid
 *
 * This View Function returns if allowlist root is valid.
 *
 * @param rpcUrl The Current Near RPC Url
 * @param contract The contract accountId to be sent on view function
 * @param root The allowlist root
 * @returns {Promise<any>}
 */
export const viewIsAllowlistRootValid = async (
  rpcUrl: string,
  contract: string,
  root: string
) => {
  return await viewFunction(rpcUrl, contract, "view_is_allowlist_root_valid", {
    root,
  });
};
