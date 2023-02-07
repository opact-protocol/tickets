import { mimc } from "@/services";

function parseNote(note: string): {
  secret: string;
  nullifier: string;
  account_hash: string;
} {
  const splitString = note.split("-");
  return {
    secret: splitString[0],
    nullifier: splitString[1],
    account_hash: splitString[2],
  };
}

export const generateCommitment = (note: string): string | undefined => {
  if (!note) return;

  const parsedNote = parseNote(note);

  const secretsHash = mimc.hash(parsedNote.secret, parsedNote.nullifier);
  const commitment = mimc.hash(secretsHash, parsedNote.account_hash);

  return commitment;
};
