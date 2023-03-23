import {
  getLastDepositOfContract,
  getLastWithdrawalOfContract,
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
