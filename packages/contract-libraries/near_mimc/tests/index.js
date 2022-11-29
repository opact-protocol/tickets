const path = require("path");
const wasm_tester = require("circom_tester").wasm;

const buildMimcSponge = require("circomlibjs").buildMimcSponge;

function leBuff2int(buff) {
  let res = BigInt(0);
  let i = 0;
  const buffV = new DataView(buff.buffer, buff.byteOffset, buff.byteLength);
  while (i < buff.length) {
    if (i + 4 <= buff.length) {
      res += BigInt(buffV.getUint32(i, true)) << BigInt(i * 8);
      i += 4;
    } else if (i + 4 <= buff.length) {
      res += BigInt(buffV.getUint16(i, true)) << BigInt(i * 8);
      i += 2;
    } else {
      res += BigInt(buffV.getUint8(i, true)) << BigInt(i * 8);
      i += 1;
    }
  }
  return res;
}

async function main() {
  let circuit;
  let mimcSponge;
  let F;

  const before = async () => {
    mimcSponge = await buildMimcSponge();
    F = mimcSponge.F;
  };

  const permutation = async () => {
    circuit = await wasm_tester(
      path.join(__dirname, "circuits", "mimc_sponge_test.circom")
    );

    const w = await circuit.calculateWitness({ xL_in: 1, xR_in: 2, k: 3 });

    const out2 = mimcSponge.hash(1, 2, 3);

    const xL_from_mont = F.fromMontgomery(out2.xL);
    const xR_from_mont = F.fromMontgomery(out2.xR);

    const xL_obj = F.toObject(out2.xL);
    const xR_obj = F.toObject(out2.xR);

    console.log("lebuff", {
      // meaningless
      xL: leBuff2int(out2.xL),
      xR: leBuff2int(out2.xR),

      // buffer repr, meaningful
      xL_from_mont_buff: xL_from_mont,
      xR_from_mont_buff: xR_from_mont,

      // int, meaningful
      xL_from_mont_int: leBuff2int(xL_from_mont),
      xR_from_mont_int: leBuff2int(xR_from_mont),

      // int, meaningful
      xL_obj,
      xR_obj,

      /*
            // buffer repr, idk if meaningful (?)
            xL_repr: F.toLEBuff(xL_obj),
            xR_repr: F.toLEBuff(xR_obj),

            // EL BUFFO
            xEL_BUFFO: F.toELBuffo(out2.xL),
            xER_BUFFO: F.toELBuffo(out2.xR),
            */
    });

    await circuit.assertOut(w, {
      xL_out: F.toObject(out2.xL),
      xR_out: F.toObject(out2.xR),
    });

    await circuit.checkConstraints(w);
  };

  const checkHash = async () => {
    circuit = await wasm_tester(
      path.join(__dirname, "circuits", "mimc_sponge_hash_test.circom")
    );

    const w = await circuit.calculateWitness({ ins: [1, 2], k: 0 });

    const out2 = mimcSponge.multiHash([1, 2], 0, 3);

    for (let i = 0; i < out2.length; i++) out2[i] = F.toObject(out2[i]);

    await circuit.assertOut(w, { outs: out2 });

    await circuit.checkConstraints(w);
  };

  await before();
  await permutation();
}

main();
