import { ModalStore } from "@/interfaces";
import { create } from "zustand";

export const useModal = create<ModalStore>((set, get) => ({
  hashModal: false,
  confirmWithdrawModal: false,

  toggleHashModal: () => {
    const { hashModal } = get();

    set(() => ({ hashModal: !hashModal }));
  },
  toggleConfirmWithdrawModal: () => {
    const { confirmWithdrawModal } = get();

    set(() => ({ confirmWithdrawModal: !confirmWithdrawModal }));
  },
}));
