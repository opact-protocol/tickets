export interface AppStore {
  initApp: () => Promise<void>;
  getAllCurrencies: () => Promise<void>;
  viewIsInAllowlist: () => Promise<void>;
  viewAccountBalance: () => void;
  allCurrencies: any;
  allowlist: boolean;
  appStarted: boolean;
  nearBalance: number,
  tokenBalance: number,
}
