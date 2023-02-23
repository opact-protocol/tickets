export const reloadPage = (walletId: string) => {
  if (walletId === "near-wallet" || walletId === "my-near-wallet") return;

  window.location.reload();
};
