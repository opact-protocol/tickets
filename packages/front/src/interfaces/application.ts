import type { ViewCurrenciesResponseInterface } from "hideyourcash-sdk";

export interface AppStore {
  initApp: () => Promise<void>;
  getAllCurrencies: () => Promise<void>;
  viewIsInAllowlist: () => Promise<void>;
  viewAccountBalance: () => void;
  allCurrencies: ViewCurrenciesResponseInterface[];
  allowlist: boolean;
  appStarted: boolean;
  nearBalance: number,
  tokenBalance: number,
}
