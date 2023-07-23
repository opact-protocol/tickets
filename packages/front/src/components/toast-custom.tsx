const icons = {
  info: 'info.svg',
  error: 'error.svg',
  warning: 'warning.svg',
  success: 'success.svg',
}

const bgs = {
  info: 'info.png',
  error: 'error.png',
  warning: 'warning.png',
  success: 'success.png',
}

export const ToastCustom = ({
  title,
  message,
  variant = 'info'
}: {
  title: string;
  message?: string;
  variant?: 'info' | 'error' | 'warning' | 'success';
}) => {
  return (
    <div className="flex w-full  rounded-[8px] overflow-hidden">
      <img
        src={bgs[variant]}
        className="absolute left-0 h-full top-0 rounded-[8px]"
      />
      {variant !== 'info' && (
        <div
          className="bg-[#303746] rounded-full p-[4px] h-[32px] w-[32px] flex justify-center items-center"
        >
          <img
            src={icons[variant]}
          />
        </div>
      )}

      <div
        className="space-y-[8px] pl-[16px]"
      >
        <h1 className="text-[#FFF] font-title text-[16px] font-[600] leading-[22px]">
          {title}
        </h1>

        <p className="text-[#E0E0E0] text-[14px] font-[700] leading-[18px]">
          {message}
        </p>
      </div>
    </div>
  );
};
