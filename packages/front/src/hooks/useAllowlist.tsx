import { viewFunction } from "@/utils/tools";
import { useEffect, useState } from "react";

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
        import.meta.env.VITE_CONTRACT,
        "view_is_in_whitelist",
        {
          account_id: accountId,
        }
      );

      setAllowList(result);
    })();
  }, [accountId]);

  return { allowList };
};
