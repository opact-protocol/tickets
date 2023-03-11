import {
  getLastDepositOfContract,
  getLastDepositsBeforeTheTicketWasCreated,
  getLastWithdrawalOfContract,
  getLastWithdrawBeforeTheTicketWasCreated,
  getTicketInTheMerkleTree,
} from "./graphql-queries";

export const poolDepositScore = async (contract: string) => {
  const lastDeposit = await getLastDepositOfContract(contract);
  const lastWithdrawal = await getLastWithdrawalOfContract(contract);

  const depositCounter = lastDeposit.length > 0 ? +lastDeposit[0].counter : 0;
  const withdrawalCounter =
    lastWithdrawal.length > 0 ? +lastWithdrawal[0].counter : 0;

  const score = depositCounter - withdrawalCounter;

  return score;
};

export const poolWithdrawScore = async (commitment: string) => {
  const tickedStored = await getTicketInTheMerkleTree(commitment);
  const lastWithdrawal = await getLastWithdrawBeforeTheTicketWasCreated(
    tickedStored.timestamp
  );
  const lastDeposit = await getLastDepositsBeforeTheTicketWasCreated(
    tickedStored.timestamp
  );

  const pastTime = Date.now();

  const score = lastWithdrawal + lastDeposit + pastTime / 3600;

  return score;
};
