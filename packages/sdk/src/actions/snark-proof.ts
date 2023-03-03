//@ts-ignore
import { plonk } from "snarkjs";
import { parseNote } from "../helpers";
import type MerkleTree from "fixed-merkle-tree";
import { mimc as mimcService } from "../services";
import type { RelayerDataInterface } from "../interfaces";
import { viewAccountHash } from "../views";
import type {
  PublicArgsInterface,
  WithdrawInputInterface,
} from "../interfaces/snark-proof";

export const createSnarkProof = async (
  payload: WithdrawInputInterface,
  verifierUrl = "./verifier.wasm",
  circuitUrl = "./circuit.zkey"
): Promise<{ proof: any; publicSignals: string[] }> => {
  /**
   * When is the first hit of IP on circuit.zkey, vercel returns 502. We retry to continue withdraw
   */
  try {
    const { proof, publicSignals } = await plonk.fullProve(
      payload,
      verifierUrl,
      circuitUrl
    );

    return { proof, publicSignals };
  } catch (e) {
    console.warn(e);

    const { proof, publicSignals } = await plonk.fullProve(
      payload,
      verifierUrl,
      circuitUrl
    );

    return { proof, publicSignals };
  }
};

export const prepareWithdraw = async (
  nodeUrl: string,
  contract: string,
  note: string,
  relayer: RelayerDataInterface,
  recipient: string,
  allowlistTree: MerkleTree,
  commitmentsTree: MerkleTree,
  verifierUrl = "./verifier.wasm",
  circuitUrl = "./circuit.zkey"
): Promise<{ publicArgs: PublicArgsInterface }> => {
  const { hash, singleHash } = await mimcService.initMimc();

  const recipientHash = await viewAccountHash(nodeUrl, contract, recipient);
  const relayerHash = await viewAccountHash(nodeUrl, contract, relayer.account);

  const commitment = parseNote(note);

  const secretsHash = hash(commitment.secret, commitment.nullifier);

  const commitmentLeaves = hash(secretsHash, commitment.account_hash);

  console.log(commitmentLeaves);

  const path = commitmentsTree.proof(commitmentLeaves);
  const pathWL = allowlistTree.proof(commitment.account_hash);

  console.log('commitmentProof');
  console.log(commitmentProof);
  console.log(' ')
  console.log('allowlistProof');
  console.log(allowlistProof);
  console.log(' ');

  const input = await getWithdrawInput(
    {
      ...relayer,
      hash: relayerHash,
    },
    recipientHash,
    path,
    pathWL,
    commitment,
    singleHash
  );

  const { proof, publicSignals } = await createSnarkProof(
    input,
    verifierUrl,
    circuitUrl
  );

  const publicArgs = getPublicArgs(proof, relayer, publicSignals, recipient);

  return {
    publicArgs,
  };
};

export const getWithdrawInput = async (
  { hash, feePercent }: RelayerDataInterface & { hash: string },
  recipientHash: string,
  path: any,
  pathAL: any,
  commitment: any,
  single_hash: any
): Promise<WithdrawInputInterface> => {
  return {
    root: path.pathRoot,
    nullifierHash: single_hash(commitment.nullifier),
    recipient: recipientHash,
    relayer: hash,
    fee: "1000000",
    refund: "0",
    nullifier: commitment.nullifier,
    secret: commitment.secret,
    pathElements: path.pathElements,
    pathIndices: path.pathIndices,
    allowlistRoot: pathAL.pathRoot,
    originDepositor: commitment.account_hash,
    allowlistPathElements: pathAL.pathElements,
    allowlistPathIndices: pathAL.pathIndices,
  };
};

export const getPublicArgs = (
  proof: any,
  relayer: RelayerDataInterface,
  publicSignals: string[],
  receiver: string
): PublicArgsInterface => {
  return {
    root: publicSignals[0],
    nullifier_hash: publicSignals[1],
    recipient: receiver,
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
  };
};
