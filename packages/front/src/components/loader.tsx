export const Loader = () => {
  return (
    <div className="w-[100vw] h-[100vh] bg-blue-[#e8eaff] flex items-center justify-center z-[-1] fixed">
      <div className="flex flex-col items-center justify-center space-y-[24px]">
        {/* <img
          src="/assets/logo-vertical.png"
          className="text-white/[0.75] w-44"
        /> */}

        <div>
           <div
             className="
                w-[190px]
                h-[18px]
                rounded-[50px]
                shadow-inner
                relative
                bg-soft-blue-normal"
            >
            <div
              className="
                rounded-[50px]
                h-[16px]
                w-[16px]
                absolute
                top-[1px]
                bottom-[2px]
                shadow-sm
                animate-loader
                bg-green"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
