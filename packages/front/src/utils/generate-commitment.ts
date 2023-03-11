import { mimc } from "@/services";

function parseNote(note: string): {
  contract: string;
  secret: string;
  nullifier: string;
  account_hash: string;
} {
  const splitString = note.split("-");
  return {
    contract: splitString[0],
    secret: splitString[1],
    nullifier: splitString[2],
    account_hash: splitString[3],
  };
}

export const generateCommitment = (note: string): string | undefined => {
  if (note.length < 220) return;

  const parsedNote = parseNote(note);

  const secretsHash = mimc.hash(parsedNote.secret, parsedNote.nullifier);
  const commitment = mimc.hash(secretsHash, parsedNote.account_hash);

  return commitment;
};
