import { plonk } from "snarkjs";
import { parseNote } from "@/helpers";
import { viewAccountHash } from "@/views";
import { mimc, buildTree } from "@/services";
import { PublicArgsInterface } from "@/interfaces/snark-proof";

export const getPublicArgs = (
  proof: any,
  relayer: any,
  publicSignals: any,
  recipient: string,
): PublicArgsInterface => {
  return {
    recipient,
    root: publicSignals[0],
    nullifier_hash: publicSignals[1],
    relayer: relayer.accountId,
    fee: publicSignals[4],
    refund: publicSignals[5],
    allowlist_root: publicSignals[6],
    a: {
      x: proof["A"][0],
      y: proof["A"][1],
    },
    b: {
      x: proof["B"][0],
      y: proof["B"][1],
    },
    c: {
      x: proof["C"][0],
      y: proof["C"][1],
    },
    z: {
      x: proof["Z"][0],
      y: proof["Z"][1],
    },
    t_1: {
      x: proof["T1"][0],
      y: proof["T1"][1],
    },
    t_2: {
      x: proof["T2"][0],
      y: proof["T2"][1],
    },
    t_3: {
      x: proof["T3"][0],
      y: proof["T3"][1],
    },
    eval_a: proof["eval_a"],
    eval_b: proof["eval_b"],
    eval_c: proof["eval_c"],
    eval_s1: proof["eval_s1"],
    eval_s2: proof["eval_s2"],
    eval_zw: proof["eval_zw"],
    eval_r: proof["eval_r"],
    wxi: {
      x: proof["Wxi"][0],
      y: proof["Wxi"][1],
    },
    wxi_w: {
      x: proof["Wxiw"][0],
      y: proof["Wxiw"][1],
    },
  }
};

export const createSnarkProof = async (
  payload: any,
): Promise<{ proof: any, publicSignals: any }> => {
  /**
   * When is the first hit of IP on circuit.zkey, vercel returns 502. We retry to continue withdraw
   */
  try {
    const { proof, publicSignals } = await plonk.fullProve(
      payload,
      "./verifier.wasm",
      "./circuit.zkey"
    );

    return { proof, publicSignals };
  } catch (e) {
    console.warn(e);

    const { proof, publicSignals } = await plonk.fullProve(
      payload,
      "./verifier.wasm",
      "./circuit.zkey"
    );

    return { proof, publicSignals };
  }
}

export const prepareWithdraw = async (
  note: string,
  relayer: any,
  recipient: string,
  relayerHash: string,
): Promise<{ publicArgs: PublicArgsInterface }> => {
  const recipientHash = viewAccountHash('', '', recipient);

  const parsedNote = parseNote(note);

  const secretsHash = mimc.hash(parsedNote.secret, parsedNote.nullifier);
  const commitment = mimc.hash(secretsHash, parsedNote.account_hash);

  const { commitmentsTree, whitelistTree } = await buildTree.initMerkleTree();

  const commitmentProof = commitmentsTree.proof(commitment);
  const whitelistProof = whitelistTree.proof(parsedNote.account_hash);

  const input = {
    refund: "0",
    relayer: relayerHash,
    recipient: recipientHash,
    secret: parsedNote.secret,
    fee: relayer.feePercent,
    root: commitmentProof.pathRoot,
    nullifier: parsedNote.nullifier,
    whitelistRoot: whitelistProof.pathRoot,
    pathIndices: commitmentProof.pathIndices,
    originDepositor: parsedNote.account_hash,
    pathElements: commitmentProof.pathElements,
    whitelistPathIndices: whitelistProof.pathIndices,
    whitelistPathElements: whitelistProof.pathElements,
    nullifierHash: mimc.singleHash!(parsedNote.nullifier),
  };

  const { proof, publicSignals } = await createSnarkProof(input);

  const publicArgs = getPublicArgs(
    proof,
    relayer,
    publicSignals,
    recipient,
  );

  return {
    publicArgs,
  }
}
