import { FungibleTokenMetadataInterface } from "./near";

export type CurrencyContract = {[key: string] : string};

export interface Currency {
  type: "Near" | "Nep141",
  account_id?: string
}

export interface ViewCurrenciesResponseInterface extends Currency {
  contracts: CurrencyContract,
  metadata: FungibleTokenMetadataInterface,
}
