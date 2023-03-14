import type { Logger } from "hideyourcash-sdk";
import { useState } from "react";

export const useProgressProof = () => {
  const [, setMessage] = useState("");
  const [progress, setProgress] = useState(0);

  const logger: Logger = {
    debug: (message: string) => {
      setMessage((prev) => {
        if (progress === 10) {
          setProgress((prev) => prev + 0.5);
          return message
        }

        if (message !== prev) {
          setProgress((prev) => prev + 1);
          return message;
        }

        return "";
      });
    },
  };

  if (progress >= 100) {
    setProgress(0);
  }

  return { logger, progress };
};
