import { UseToast } from "./toast";
import { toast } from "react-toastify";
import { ToastCustom } from "@/components/toast-custom";

export const useToast = async ({
  id,
  title,
  message,
  variant,
}: UseToast) => {
  toast(
    <ToastCustom
      title={title}
      variant={variant}
      message={message}
    />,
    {
      toastId: id,
    }
  )
}

export default useToast
