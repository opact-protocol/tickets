import { viewFunction } from "@/utils/tools";
import { useEffect, useState } from "react";
import { mimc } from "@/services/mimc";
import { useEnv } from "./useEnv";

export const useNullfierCheck = (note: string, selector: any) => {
  const [nullfierInvalid, setNullfierInvalid] = useState<boolean>(false);

  useEffect(() => {
    if (!note) {
      setNullfierInvalid(false);
      return;
    }

    (async () => {
      const result = await viewFunction(
        selector,
        useEnv("VITE_CONTRACT"),
        "view_was_nullifier_spent",
        {
          nullifier: mimc.singleHash!(note.split("-")[1])
        }
      );

      setNullfierInvalid(result);
    })();
  }, [note]);

  return { nullfierInvalid };
};
