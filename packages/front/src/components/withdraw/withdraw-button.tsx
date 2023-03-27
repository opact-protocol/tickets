import { useState } from "react";
import { useWithdraw } from "@/store";
import { Button } from "@/components/button";
import ConfirmModal from "./confirm-modal";

export const WithdrawButton = ({
  onClick,
  isLoading,
  buttonText,
  isDisabled,
  cleanupInputs,
}: {
  isLoading: boolean,
  buttonText: string,
  isDisabled: boolean,
  onClick: () => void,
  cleanupInputs: () => void,
}) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button
        isLoading={!isLoading}
        onClick={async () => {
          await onClick()
          setShowModal(true);
        }}
        text={!showModal ? "Withdraw" : buttonText}
        disabled={isDisabled}
      />

      <ConfirmModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        cleanupInputsCallback={() => {
          cleanupInputs();
        }}
      />
    </>
  );
};
