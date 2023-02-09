export interface RelayerPayload {
  currency: string;
  quantity: string;
  root: string;
  nullifier_hash: string;
  recipient: string;
  relayer: string;
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

export type RelayerResponse =
  | {
      status: "success";
      transaction: string;
    }
  | {
      status: "failure";
      error: any;
    };
