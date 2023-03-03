import type BN from 'bn.js';
// @ts-ignore
import { buildMimcSponge } from 'circomlibjs';

type IntoBigInt = string | number | bigint | boolean | BN;

export class MimcSponge {
  sponge: any;
  initialized = false;

  async initMimc() {
    this.sponge = await buildMimcSponge();

    this.initialized = true;

    return this;
  }

  hash (left: IntoBigInt, right: IntoBigInt): string {
    if (!this.initialized) {
      return '';
    }

    return this.sponge.F.toString(
      this.sponge.multiHash([BigInt(left as any), BigInt(right as any)])
    );
  }

  singleHash (single: IntoBigInt): string {
    if (!this.initialized) {
      return '';
    }

    return this.sponge.F.toString(this.sponge.multiHash([BigInt(single as any)]));
  }
}

const mimc = new MimcSponge();

export {
  mimc,
}
