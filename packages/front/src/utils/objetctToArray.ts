import { AmountsProps } from "@/interfaces";

export const objetctToArray = (data: any) => {
  const amounts: AmountsProps[] = [];

  for (const value in data) {
    amounts.push({ value, accountId: data[value] });
  }

  return amounts.sort((amountA, amountB) => Number(amountA.value) - Number(amountB.value));
};
