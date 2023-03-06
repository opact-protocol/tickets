import { providers } from "near-api-js";
import { Buffer } from "buffer";
import { AttachedGas, nearNominationExp } from "../constants";

export const viewFunction = async (
  nodeUrl: string,
  contractId: string,
  methodName: string,
  args: any
) => {
  const provider = new providers.JsonRpcProvider(nodeUrl);

  const serializedArgs = Buffer.from(JSON.stringify(args)).toString("base64");

  const res = (await provider.query({
    request_type: "call_function",
    account_id: contractId,
    method_name: methodName,
    args_base64: serializedArgs,
    finality: "optimistic",
  })) as any;

  return JSON.parse(Buffer.from(res.result).toString());
};

export const getTransaction = (
  signerId: string,
  receiverId: string,
  method: string,
  args: object,
  amount?: string | undefined,
  skipParser = false
): any => {
  const deposit = getAmount(amount, skipParser);

  return {
    signerId,
    receiverId,
    actions: [
      {
        type: "FunctionCall",
        params: {
          methodName: method,
          args,
          gas: AttachedGas,
          deposit,
        },
      },
    ],
  };
};

export const getAmount = (amount: string | undefined, skip = false) => {
  if (!amount) {
    return "1";
  }

  if (skip) {
    return amount;
  }

  return parseNearAmount(amount)!;
};

/**
 * Convert human readable NEAR amount to internal indivisible units.
 * Effectively this multiplies given amount.
 *
 * @param rawAmount decimal string (potentially fractional) denominated in NEAR.
 * @returns The parsed yoctoⓃ amount or null if no amount was passed in
 */
export const parseNearAmount = (rawAmount?: string) => {
  if (!rawAmount) {
    return null;
  }

  if (rawAmount === "1") {
    return "1";
  }

  const amount = cleanupRawAmount(rawAmount);

  const split = amount.split(".");

  const wholePart = split[0];

  const fracPart = split[1] || "";

  if (split.length > 2 || fracPart.length > nearNominationExp) {
    throw new Error(`Cannot parse '${amount}' as NEAR amount`);
  }
  return trimLeadingZeroes(wholePart + fracPart.padEnd(nearNominationExp, "0"));
};

export const cleanupRawAmount = (amount: string) => {
  return amount.replace(/,/g, "").trim();
};

export const trimLeadingZeroes = (value: string) => {
  const replacedValue = value.replace(/^0+/, "");

  if (replacedValue === "") {
    return "0";
  }

  return replacedValue;
};

export const getPublicArgs = ({
  proof,
  relayer,
  receiver,
  publicSignals,
}: {
  proof: any;
  relayer: string;
  publicSignals: string[];
  receiver: string;
}): any => {
  return {
    root: publicSignals[0],
    nullifier_hash: publicSignals[1],
    recipient: receiver,
    relayer: relayer,
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
