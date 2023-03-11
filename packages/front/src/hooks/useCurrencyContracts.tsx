import { viewFunction } from "@/utils/tools";
import { viewCurrencyContracts } from "hideyourcash-sdk";
import { useEffect, useState } from "react";
import { useEnv } from "./useEnv";

interface CurrencyContracts {
  value: string;
  accountId: string;
}

export const useCurrencyContracts = (selector: any, currency: any) => {
  const [currencyContracts, setCurrencyContracts] =
    useState<CurrencyContracts[]>();
  const amounts: CurrencyContracts[] = [];

  useEffect(() => {
    if (!selector || currency.type !== "Near") return;

    (async () => {
      const res = await viewFunction(
        selector,
        useEnv("VITE_CONTRACT"),
        "view_currency_contracts",
        { currency }
      );
      for (const value in res) {
        amounts.push({ value, accountId: res[value] });
      }
      setCurrencyContracts(amounts);
    })();
  }, [selector, currency]);

  return { currencyContracts };
};
