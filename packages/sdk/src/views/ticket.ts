import { mimc } from '../services';
import { viewFunction } from "../helpers";

export const viewWasNullifierSpent = async (
  nodeUrl: string,
  contract: string,
  nullifier: string,
) => {
  return await viewFunction(
    nodeUrl,
    contract,
    "view_was_nullifier_spent",
    {
      nullifier: mimc.singleHash!(nullifier.split("-")[1]),
    }
  )
}
