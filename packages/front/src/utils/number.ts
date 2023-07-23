import { CurrencyContract } from "hideyourcash-sdk";

export const formatAmounts = (data: CurrencyContract) => {
  const amounts: CurrencyContract[] = [];

  for (const value in data) {
    amounts.push({ value, accountId: data[value] });
  }

  return amounts.sort(
    (amountA, amountB) => Number(amountA.value) - Number(amountB.value)
  );
}
