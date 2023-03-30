import { mimc } from "../services";
import { viewFunction } from "../helpers";

/**
 * View Was Nullifier Spent
 *
 * This View Function return if nullifier already spent.
 *
 * @param nodeUrl The Current Near RPC Url
 * @param ticket The note to withdraw
 * @returns {Promise<any>}
 */
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
