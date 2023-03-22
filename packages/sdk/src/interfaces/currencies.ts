import type { FungibleTokenMetadataInterface } from "./near";

export type CurrencyContract = { [key: string]: string };

export interface Currency {
  type: string
  account_id?: string;
}

export interface ViewCurrenciesResponseInterface extends Currency {
  contracts: CurrencyContract;
  metadata: FungibleTokenMetadataInterface;
}
