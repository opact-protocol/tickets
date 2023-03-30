import type { ParseNoteInterface } from "../interfaces";

/**
 * Helpers: Parse Note
 *
 * This method is responsible for parsing a ticket.
 *
 * @param note The note to withdraw
 * @returns {Promise<ParseNoteInterface>}
 */
export const parseNote = (note: string): ParseNoteInterface => {
  const splitString = note.split("-");

  return {
    contract: splitString[0],
    secret: splitString[1],
    nullifier: splitString[2],
    account_hash: splitString[3],
  };
};
