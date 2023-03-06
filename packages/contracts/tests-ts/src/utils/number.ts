import crypto from "crypto";
import { toBN } from "web3-utils";
import { BN } from "near-workspaces";

export const leInt2Buff = (value: any) => {
  return new BN(value, 16, "le");
};

export const randomBN = (nbytes = 31) => {
  return toBN(leInt2Buff(crypto.randomBytes(nbytes)).toString()).toString();
};
