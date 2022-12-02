export interface MoneyConfiguration {
  contractId: string;
}

export interface Nep171TokenInterface {
  token_id: string;
  owner_id: string;
  FinalExecutionOutcome: string;
}

export interface ContractWithdrawInterface {
  root: string;
  nullifier_hash: string;
  recipient: string;
  relayer: null;
  fee: string;
  refund: string;
  whitelist_root: string;
  proof: {
    a: {
      x: string;
      y: string;
    };
    b: {
      x: string;
      y: string;
    };
    c: {
      x: string;
      y: string;
    };
  };
}
