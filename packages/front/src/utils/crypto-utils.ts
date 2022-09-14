import BN from "bn.js";
import { toBN } from "web3-utils";
import randomBytes from "randombytes";

const CUT_LENGTH = 31;

export function newSecret(hexNote) {
  const buffNote = Buffer.from(hexNote.slice(2), "hex");

  return BigInt(
    leInt2Buff(buffNote.slice(CUT_LENGTH, CUT_LENGTH * 2)).toString()
  );
}

export function leInt2Buff(value) {
  return new BN(value, 16, "le");
}

export function randomBN(nbytes = 31) {
  return toBN(leInt2Buff(randomBytes(nbytes)).toString());
}

export function toFixedHex(value, length = 32) {
  const isBuffer = value instanceof Buffer;

  const str = isBuffer ? value.toString("hex") : BigInt(value).toString(16);
  return "0x" + str.padStart(length * 2, "0");
}

export function packEncryptedMessage(encryptedMessage) {
  const nonceBuf = Buffer.from(encryptedMessage.nonce, "base64");
  const ephemPublicKeyBuf = Buffer.from(
    encryptedMessage.ephemPublicKey,
    "base64"
  );
  const ciphertextBuf = Buffer.from(encryptedMessage.ciphertext, "base64");
  const messageBuff = Buffer.concat([
    Buffer.alloc(24 - nonceBuf.length),
    nonceBuf,
    Buffer.alloc(32 - ephemPublicKeyBuf.length),
    ephemPublicKeyBuf,
    ciphertextBuf,
  ]);
  return "0x" + messageBuff.toString("hex");
}

export function unpackEncryptedMessage(encryptedMessage) {
  if (encryptedMessage.slice(0, 2) === "0x") {
    encryptedMessage = encryptedMessage.slice(2);
  }
  const messageBuff = Buffer.from(encryptedMessage, "hex");
  const nonceBuf = messageBuff.slice(0, 24);
  const ephemPublicKeyBuf = messageBuff.slice(24, 56);
  const ciphertextBuf = messageBuff.slice(56);
  return {
    version: "x25519-xsalsa20-poly1305",
    nonce: nonceBuf.toString("base64"),
    ephemPublicKey: ephemPublicKeyBuf.toString("base64"),
    ciphertext: ciphertextBuf.toString("base64"),
  };
}
