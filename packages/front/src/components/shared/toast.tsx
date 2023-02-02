import { XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const Toast = ({
  icon,
  title,
  message,
  visible,
}: {
  icon: string;
  title: string;
  message: string;
  visible: boolean;
}) => {
  const [isVisible, setIsVisible] = useState(visible);

  useEffect(() => {
    (async () => {
      await delay(10000);
      setIsVisible(false);
    })();
  }, []);

  return (
    <div
      className={`${!icon && "hidden"} ${
        isVisible ? "animate-slide-left" : "animate-slide-right"
      } flex-col bg-white w-[480px] p-5 rounded-[20px] pointer-events-auto fixed bottom-[24px] right-[-500px] z-[9999]`}
    >
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
        <button onClick={() => setIsVisible(false)} className="text-black">
          <XMarkIcon className="text-black w-[24px]" />
        </button>
      </div>
      <p className="text-dark-grafiti-medium text-md font-normal pl-4">
        {message}
      </p>
    </div>
  );
};
export default Toast;
