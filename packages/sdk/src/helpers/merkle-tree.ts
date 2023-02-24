import { ParseNoteInterface } from "@/interfaces";

export const parseNote = (note: string): ParseNoteInterface => {
  const splitString = note.split("-");

  return {
    secret: splitString[0],
    nullifier: splitString[1],
    account_hash: splitString[2],
  };
}
