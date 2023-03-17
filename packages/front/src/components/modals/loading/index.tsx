import { useEffect, useState } from "react";

export const LoadingModal = ({
  generatingProof,
}: {
  generatingProof: boolean;
}) => {
  const [progress, setProgress] = useState<number>(0);
  const totalTime = 90;
  const updateInterval = 100;
  const increment = 100 / ((totalTime * 1000) / updateInterval);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (generatingProof) {
          if (prevProgress === 99) {
            clearInterval(interval);
            return prevProgress;
          }
          return (prevProgress += increment);
        } else {
          return 100;
        }
      });
      return () => clearInterval(interval);
    }, updateInterval);
  }, []);

  return (
    <>
      <p className="text-dark-grafiti-medium text-center text-lg font-bold mt-2">
        Generating your zero knowledge proof
      </p>
      <div className="relative overflow-hidden w-full max-w-[350px] bg-gray-200 rounded-full">
        <div
          className={`bg-dark-grafiti-medium h-full text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full transition-all duration-500`}
          style={{ width: `${progress.toFixed(0)}%` }}
        >
          {" "}
          {progress.toFixed(0)}%
        </div>
      </div>
      <p className="text-dark-grafiti-light text-base font-semibold text-center">
        This may take a few minutes
      </p>
    </>
  );
};
