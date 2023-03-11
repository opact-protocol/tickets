export interface AmountsProps {
  value: string;
  accountId: string;
}

export const objetctToArray = (data: any) => {
  const amounts: AmountsProps[] = [];

  for (const value in data) {
    amounts.push({ value, accountId: data[value] });
  }

  return amounts;
};
