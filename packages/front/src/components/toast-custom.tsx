export const ToastCustom = ({
  icon,
  title,
  message
}: {
  icon: string;
  title: string;
  message?: string;
}) => {
  return (
    <>
      <div className="flex gap-2 pl-4 items-cente justify-between">
        <div className="flex gap-2 items-center">
          {icon === "processing" ? (
            <div className="relative w-5 h-5 animate-spin rounded-full bg-info">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full"></div>
            </div>
          ) : (
            <img src={icon} alt="" className="w-5" />
          )}

          <h1 className="text-dark-grafiti-medium font-bold font-[Sora] text-md">
            {title}
          </h1>
        </div>
      </div>
      <p className="text-dark-grafiti-medium text-md font-normal mt-2 pl-4">
        {message}
      </p>
    </>
  );
};
