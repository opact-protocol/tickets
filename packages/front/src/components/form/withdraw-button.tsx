import { Button } from "@/components/button";

export const WithdrawButton = ({
  onClick,
  isLoading,
  buttonText,
  isDisabled,
}: {
  isLoading: boolean,
  buttonText: string,
  isDisabled: boolean,
  onClick: () => void,
}) => {
  return (
    <Button
      text={buttonText}
      isLoading={isLoading}
      disabled={isDisabled}
      onClick={() => onClick()}
    />
  );
};
