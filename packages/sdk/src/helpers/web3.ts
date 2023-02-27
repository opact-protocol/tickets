import BN from "bn.js";
import { toBN } from "web3-utils";
import randomBytes from 'randombytes';

export function leInt2Buff(value: string) {
  return new BN(value, 16, "le");
}

export function randomBN(nbytes = 31) {
  return toBN(leInt2Buff(randomBytes(nbytes)).toString());
}
