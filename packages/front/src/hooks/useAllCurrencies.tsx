import {
  viewAllCurrencies,
  ViewCurrenciesResponseInterface,
} from "hideyourcash-sdk";
import { useEffect, useState } from "react";
import { useEnv } from "./useEnv";

export const useAllCurrencies = () => {
  const [allCurrencies, setAllCurrencies] = useState<
    ViewCurrenciesResponseInterface[]
  >([]);

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
