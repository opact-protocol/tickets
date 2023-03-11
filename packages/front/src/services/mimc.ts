import { buildMimcSponge } from "circomlibjs";
import BN from "bn.js";

type IntoBigInt = string | number | bigint | boolean | BN;

class MimcSponge {
  sponge: any;

  constructor() {
    this.initMimc();
  }

  async initMimc() {
    this.sponge = await buildMimcSponge();
  }

  hash = (left: IntoBigInt, right: IntoBigInt): string => {
    return this.sponge.F.toString(
      this.sponge.multiHash([BigInt(left as any), BigInt(right as any)])
    );
  };

  singleHash = (single: IntoBigInt): string => {
    return this.sponge.F.toString(
      this.sponge.multiHash([BigInt(single as any)])
    );
  };
}

export const mimc = new MimcSponge();
