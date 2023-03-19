import { useEffect, useState } from "react";

export const LoadingModal = ({ progress, loading }: { progress: number, loading: boolean }) => {
  const [localProgress, setLocalProgress] = useState(0);

  useEffect(() => {
    if (!loading) {
      setLocalProgress(0);

      return;
    }

    setLocalProgress(progress);
  }, [loading, progress]);

  return (
    <>
      <p className="text-dark-grafiti-medium text-center text-lg font-bold mt-2 pointer-events-auto">
        Generating your zero knowledge proof
      </p>
      <div className="relative overflow-hidden w-full max-w-[350px] bg-gray-200 rounded-full">
        <div
          className={`bg-dark-grafiti-medium text-xs font-medium text-blue-100 text-center h-[15px] p-0.5 leading-none rounded-full`}
          style={{
            width: `${localProgress.toFixed(0)}%`,
            transition: 'width 3s',
          }}
        />
      </div>
      <p className="text-dark-grafiti-light text-base font-semibold text-center">
        This may take a few minutes
      </p>
    </>
  );
};
