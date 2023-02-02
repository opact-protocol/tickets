import { viewFunction } from "@/utils/tools";
import { useEffect, useState } from "react";
import { useEnv } from "./useEnv";

export const useAllowlist = (accountId: string, selector: any) => {
  const [allowList, setAllowList] = useState<boolean>(false);

  useEffect(() => {
    if (!accountId) {
      setAllowList(false);
      return;
    }

    (async () => {
      const result = await viewFunction(
        selector,
        useEnv("VITE_CONTRACT"),
        "view_is_in_allowlist",
        {
          account_id: accountId
        }
      );

      setAllowList(result);
    })();
  }, [accountId]);

  return { allowList };
};
