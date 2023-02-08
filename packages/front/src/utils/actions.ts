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
];

export default actions;
