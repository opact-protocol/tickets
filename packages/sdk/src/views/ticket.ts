import { mimc } from "../services";
import { viewFunction } from "../helpers";

export const viewWasNullifierSpent = async (
  nodeUrl: string,
  ticket: string
) => {
  const { singleHash } = await mimc.initMimc();

  const contract = ticket.split("-")[0];
  const nullifier = ticket.split("-")[2];

  return await viewFunction(nodeUrl, contract, "view_was_nullifier_spent", {
    nullifier: singleHash(nullifier),
  });
};
