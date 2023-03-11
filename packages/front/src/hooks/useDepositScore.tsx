import { poolDepositScore } from "@/utils/poolScores";
import { useEffect, useState } from "react";

export const useDepositScore = (contract: string) => {
  const [depositScore, setDepositScore] = useState(0);

  useEffect(() => {
    if (!contract) return;

    (async () => {
      const score = await poolDepositScore(contract);
      setDepositScore(score);
    })();
  }, [contract]);

  return { depositScore };
};
