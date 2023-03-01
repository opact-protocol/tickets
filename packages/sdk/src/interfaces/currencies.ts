import { FungibleTokenMetadataInterface } from "./near";

export type CurrencyContract = {[key: string] : string};

export interface ViewCurrenciesResponseInterface {
  type: string,
  accountId?: string,
  metadata: FungibleTokenMetadataInterface,
  contracts: CurrencyContract,
}
