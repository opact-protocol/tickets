export * from './date';
export * from './near';
export * from './number';

export const shortenAddress = (address: string, chars = 8): string => {
  if (!address) {
    return '';
  }
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};



