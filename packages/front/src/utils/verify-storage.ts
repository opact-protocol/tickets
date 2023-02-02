export const verifyStorage = (method: string) => {
  if (localStorage.getItem(method)) return true;

  return false;
};
