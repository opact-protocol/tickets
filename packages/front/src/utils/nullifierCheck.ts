import { useEnv } from "@/hooks/useEnv";
import { mimc } from "@/services";
import { viewFunction } from "./tools";

export const nullifierCheck = async (note: string, selector: any) => {
  if (note.length < 220) return;

  const result = await viewFunction(
    selector,
    useEnv("VITE_CONTRACT"),
    "view_was_nullifier_spent",
    {
      nullifier: mimc.singleHash!(note.split("-")[1])
    }
  );

  return result;
};
