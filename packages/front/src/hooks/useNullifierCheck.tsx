import { useEffect, useState } from "react";
import { useEnv } from "./useEnv";
import { viewWasNullifierSpent } from "hideyourcash-sdk";

export const useNullfierCheck = (note: string) => {
  const [nullfierInvalid, setNullfierInvalid] = useState<boolean>(false);

  useEffect(() => {
    if (!note) {
      setNullfierInvalid(false);
      return;
    }

    (async () => {
      const result = await viewWasNullifierSpent(
        useEnv("VITE_NEAR_NODE_URL"),
        useEnv("VITE_CONTRACT"),
        note
      );

      setNullfierInvalid(result);
    })();
  }, [note]);

  return { nullfierInvalid };
};
