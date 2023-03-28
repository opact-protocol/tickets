import type BN from "bn.js";
// @ts-ignore
import { buildMimcSponge } from "circomlibjs";

type IntoBigInt = string | number | bigint | boolean | BN;

/**
 * This class provides a Circom Mimc Sponge services.
 */
export class MimcSponge {
  sponge: any;
  initialized = false;

  async initMimc() {
    const sponge = await buildMimcSponge();

    return {
      hash: (left: IntoBigInt, right: IntoBigInt): string => {
        return sponge.F.toString(
          sponge.multiHash([BigInt(left as any), BigInt(right as any)])
        );
      },
      singleHash: (single: IntoBigInt): string => {
        return sponge.F.toString(sponge.multiHash([BigInt(single as any)]));
      },
    };
  }
}

const mimc = new MimcSponge();

export { mimc };
