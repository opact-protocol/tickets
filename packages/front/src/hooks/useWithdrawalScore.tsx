import { poolDepositScore } from "@/utils/poolScores";
import { useEffect, useState } from "react";

export const useWithdrawalScore = (commitment: string) => {
  const [withdrawalScore, setWithdrawalScore] = useState(0);

  useEffect(() => {
    if (!commitment) return;

    (async () => {
      const score = await poolDepositScore(commitment);
      setWithdrawalScore(score);
    })();
  }, [commitment]);

  return { withdrawalScore };
};
