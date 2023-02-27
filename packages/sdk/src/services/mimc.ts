import BN from "bn.js";
// @ts-ignore
import { buildMimcSponge } from 'circomlibjs';

type IntoBigInt = string | number | bigint | boolean | BN;

export class MimcSponge {
  sponge: any;

  constructor() {
    this.initMimc();
  }

  async initMimc() {
    this.sponge = await buildMimcSponge();
  }

  hash (left: IntoBigInt, right: IntoBigInt): string {
    return this.sponge.F.toString(
      this.sponge.multiHash([BigInt(left as any), BigInt(right as any)])
    );
  }

  singleHash (single: IntoBigInt): string {
    return this.sponge.F.toString(this.sponge.multiHash([BigInt(single as any)]));
  }
}

const mimc = new MimcSponge();

export {
  mimc,
}
