import { TransactionPayload } from "./tools/modules/near";

export interface Actionable {
  error: string;
  success: string;
  check: ({ transaction: { actions } }: TransactionPayload) => boolean;
}

export const actions = [
  {
    error: "The funds had been sent back to your wallet.",
    success: "Wait at least 30 minutes to withdraw",
    methodName: "deposit",
    check: ({ transaction: { actions } }: TransactionPayload) => {
      const [action] = actions;

      return action.FunctionCall.method_name === "deposit";
    },
  },
  {
    error: "Verify your address to be able to make transactions",
    success: "You can start making transactions with safety",
    methodName: "allowlist",
    check: ({ transaction: { actions } }: TransactionPayload) => {
      const [action] = actions;

      return action.FunctionCall.method_name === "allowlist";
    },
  },
];

export default actions;
