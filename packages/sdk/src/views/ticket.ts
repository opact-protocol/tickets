import { mimc } from "@/services";
import { viewFunction } from "@/helpers";

export const viewWasNullifierSpent = (
  nodeUrl: string,
  contract: string,
  nullifier: string,
) => {
  return viewFunction(
    nodeUrl,
    contract,
    "view_was_nullifier_spent",
    {
      nullifier: mimc.singleHash!(nullifier.split("-")[1])
    }
  )
}
