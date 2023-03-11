import { viewIsInAllowlist } from "hideyourcash-sdk";
import { useEffect, useState } from "react";
import { useEnv } from "./useEnv";

export const useAllowlist = (accountId: string) => {
  const [allowList, setAllowList] = useState<boolean>(false);

  useEffect(() => {
    if (!accountId) {
      setAllowList(false);
      return;
    }

    (async () => {
      const result = await viewIsInAllowlist(
        useEnv("VITE_NEAR_NODE_URL"),
        useEnv("VITE_CONTRACT"),
        accountId
      );

      setAllowList(result);
    })();
  }, [accountId]);

  return { allowList };
};
