//@ts-ignore
import { plonk } from 'snarkjs';
import { mimc } from '../services';
import { parseNote } from '../helpers';
import type MerkleTree from 'fixed-merkle-tree';
import type { RelayerDataInterface } from '../interfaces';
import { viewAccountHash, viewRelayerHash } from '../views';
import type { PublicArgsInterface, WithdrawInputInterface } from '../interfaces/snark-proof';

export const createSnarkProof = async (
  payload: WithdrawInputInterface,
): Promise<{ proof: any, publicSignals: string[] }> => {
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
  nodeUrl: string,
  contract: string,
  note: string,
  relayer: RelayerDataInterface,
  recipient: string,
  allowlistTree: MerkleTree,
  commitmentsTree: MerkleTree,
): Promise<{ publicArgs: PublicArgsInterface }> => {
  await mimc.initMimc();

  const recipientHash = await viewAccountHash(nodeUrl, contract, recipient);
  const relayerHash = await viewRelayerHash(nodeUrl, contract, relayer);

  const parsedNote = parseNote(note);

  const secretsHash = mimc.hash(parsedNote.secret, parsedNote.nullifier);
  const commitment = mimc.hash(secretsHash, parsedNote.account_hash);

  const commitmentProof = commitmentsTree.proof(commitment);
  const allowlistProof = allowlistTree.proof(parsedNote.account_hash);

  const input = await getWithdrawInput(
    {...relayer, hash: relayerHash },
    parsedNote,
    recipientHash,
    allowlistProof,
    commitmentProof,
  );

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

export const getWithdrawInput = async (
  relayer: RelayerDataInterface & { hash: string },
  parsedNote: any,
  recipientHash: string,
  allowlistProof: any,
  commitmentProof: any,
): Promise<WithdrawInputInterface> => {
  return {
    refund: "0",
    relayer: relayer.hash,
    fee: relayer.feePercent,
    recipient: recipientHash,
    secret: parsedNote.secret,
    root: commitmentProof.pathRoot,
    nullifier: parsedNote.nullifier,
    whitelistRoot: allowlistProof.pathRoot,
    pathIndices: commitmentProof.pathIndices,
    originDepositor: parsedNote.account_hash,
    pathElements: commitmentProof.pathElements,
    whitelistPathIndices: allowlistProof.pathIndices,
    whitelistPathElements: allowlistProof.pathElements,
    nullifierHash: mimc.singleHash!(parsedNote.nullifier),
  }
}

export const getPublicArgs = (
  proof: any,
  relayer: RelayerDataInterface,
  publicSignals: string[],
  recipient: string,
): PublicArgsInterface => {
  return {
    recipient,
    root: publicSignals[0],
    nullifier_hash: publicSignals[1],
    relayer: relayer.account,
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
