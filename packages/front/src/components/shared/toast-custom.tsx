import toast from "react-hot-toast";
import { XMarkIcon } from "@heroicons/react/24/outline";

export const ToastCustom = ({
  visible,
  id,
  icon,
}: {
  visible: boolean;
  id: string;
  icon: string;
}) => {
  return (
    <div
      className={`${
        visible ? "animate-slide-left" : "animate-slide-right"
      } flex-col bg-white w-[480px] p-5 rounded-[20px] pointer-events-auto fixed bottom-[24px] right-[-500px] z-[9999]`}
    >
      <div className="flex gap-2 pl-4 items-cente justify-between">
        <div className="flex gap-2 items-center">
          <img src={icon} alt="Error circle" />
          <h1 className="text-dark-grafiti-medium font-bold font-[Sora] text-md">
            Withdraw error
          </h1>
        </div>
        <button onClick={() => toast.dismiss(id)} className="text-black">
          <XMarkIcon className="text-black w-[24px]" />
        </button>
      </div>
      <p className="text-dark-grafiti-medium text-md font-normal pl-4">
        An error occured. It may be intermittent due to RPC cache, please try
        again in 10 minutes.
      </p>
    </div>
  );
};
