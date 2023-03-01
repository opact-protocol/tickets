import { viewAllCurrencies } from "hideyourcash-sdk";
import { useEffect, useState } from "react";
import { useEnv } from "./useEnv";

interface AllCurrencieProps {
  type: string;
  account_id: string;
}

export const useAllCurrencies = () => {
  const [allCurrencies, setAllCurrencies] = useState<AllCurrencieProps[]>();

  useEffect(() => {
    (async () => {
      const res = await viewAllCurrencies(
        useEnv("VITE_NEAR_NODE_URL"),
        useEnv("VITE_CONTRACT")
      );
      setAllCurrencies(res);
    })();
  }, []);

  return { allCurrencies };
};
