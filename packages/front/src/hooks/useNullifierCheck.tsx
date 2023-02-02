import { viewFunction } from "@/utils/tools";
import { useEffect, useState } from "react";

export const useNullfierCheck = (note: string, selector: any) => {
  const [nullifierValid, setNullifierValid] = useState<boolean>(false);

  useEffect(() => {
    if (!note) return;

    (async () => {
      const result = await viewFunction(
        selector,
        import.meta.env.VITE_CONTRACT,
        "view_was_nullifier_spent",
        {
          nullifier: note.split("-")[1]
        }
      );

      setNullifierValid(result);
    })();
  }, [note]);

  return { nullifierValid };
};
