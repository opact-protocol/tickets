export * from "./date";
export * from "./near";
export * from "./web3";
export * from "./number";
export * from "./merkle-tree";

export const shortenAddress = (address: string, chars = 8): string => {
  if (!address) {
    return "";
  }

  if (address.length <= 8 || address.includes('.near')) {
    return address
  }

  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};
