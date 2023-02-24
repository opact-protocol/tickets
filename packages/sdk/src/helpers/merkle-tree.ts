export const parseNote = (note: string): {
  secret: string;
  nullifier: string;
  account_hash: string;
} => {
  const splitString = note.split("-");

  return {
    secret: splitString[0],
    nullifier: splitString[1],
    account_hash: splitString[2],
  };
}
