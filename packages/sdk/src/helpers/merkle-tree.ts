import type { ParseNoteInterface } from '../interfaces';

export const parseNote = (note: string): ParseNoteInterface => {
  const splitString = note.split("-");

  console.log(' - splitString - ');
  console.log(splitString);
  console.log(' - splitString - ');

  return {
    contract: splitString[0],
    secret: splitString[1],
    nullifier: splitString[2],
    account_hash: splitString[3],
  };
}
