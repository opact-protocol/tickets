export interface PublicArgsInterface {
  quantity?: string;
  root: string;
  nullifier_hash: string;
  recipient: string;
  relayer: any;
  fee: string;
  refund: string;
  allowlist_root: string;
  a: any;
  b: any;
  c: any;
  z: any;
  t_1: any;
  t_2: any;
  t_3: any;
  eval_a: string;
  eval_b: string;
  eval_c: string;
  eval_s1: string;
  eval_s2: string;
  eval_zw: string;
  eval_r: string;
  wxi: any;
  wxi_w: any;
}

export interface WithdrawInputInterface {
  fee: string;
  root: string;
  refund: string;
  secret: string;
  relayer: string;
  nullifier: string;
  recipient: string;
  pathIndices: string;
  pathElements: string;
  allowlistRoot: string;
  nullifierHash: string;
  originDepositor: string;
  allowlistPathIndices: string;
  allowlistPathElements: string;
}

export interface ParseNoteInterface {
  secret: string;
  contract: string;
  nullifier: string;
  account_hash: string;
}
