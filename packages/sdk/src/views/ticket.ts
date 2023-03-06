import { mimc } from "../services";
import { viewFunction } from "../helpers";

export const viewWasNullifierSpent = async (
  nodeUrl: string,
  contract: string,
  nullifier: string
) => {
  const { singleHash } = await mimc.initMimc();

  return await viewFunction(nodeUrl, contract, "view_was_nullifier_spent", {
    nullifier: singleHash(nullifier.split("-")[1]),
  });
};
