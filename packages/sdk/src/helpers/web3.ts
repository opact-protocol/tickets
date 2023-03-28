import BN from "bn.js";
import { toBN } from "web3-utils";
import randomBytes from "randombytes";

/**
 * Left Int to Buff
 * @param value the base value to create new BN
 * @returns {Promise<BN>}
 */
export function leInt2Buff(value: any) {
  return new BN(value, 16, "le");
}

/**
 * Random BN
 * @param nbytes the number of bytes to radom BN
 * @returns {Promise<BN>}
 */
export function randomBN(nbytes = 31) {
  return toBN(leInt2Buff(randomBytes(nbytes)).toString());
}
