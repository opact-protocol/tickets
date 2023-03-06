import type { ParseNoteInterface } from "../interfaces";

export const parseNote = (note: string): ParseNoteInterface => {
  const splitString = note.split("-");

  return {
    contract: splitString[0],
    secret: splitString[1],
    nullifier: splitString[2],
    account_hash: splitString[3],
  };
};
