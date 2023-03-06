import { mimc } from "../services";

export const merkleTreeOptions = {
  zeroElement:
    "21663839004416932945382355908790599225266501822907911457504978515578255421292",
  hashFunction: mimc.hash,
};

export const graphqlUrl = "";

export const merkleTreeMethods = {
  deposit: "hyc-deposits",
  allowlist: "hyc-allowlists",
};

export const merkleTreeBaseRequest = {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
};
