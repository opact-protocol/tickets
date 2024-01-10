import { toast } from "react-toastify";
import { ToastCustom } from "@/components/toast-custom";

export interface UseToast {
  id: string;
  title: string;
  message: string;
  variant: "info" | "error" | "warning" | "success" | undefined;
}

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
