export const LoadingModal = ({ progress }: { progress: number }) => {
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
