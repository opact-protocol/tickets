export interface UseToast {
  id: string;
  title: string;
  message: string;
  variant: "info" | "error" | "warning" | "success" | undefined;
}
