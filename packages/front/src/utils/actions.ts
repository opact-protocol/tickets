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

      return (
        action.FunctionCall.method_name === "deposit" ||
        action.FunctionCall.method_name === "ft_transfer_call"
      );
    },
  },
  {
    error:
      "An error occured. It may be intermittent due to RPC cache, please try again in 10 minutes.",
    success: "The funds has been withdraw to the address.",
    methodName: "withdraw",
    check: ({ transaction: { actions } }: TransactionPayload) => {
      const [action] = actions;

      return action.FunctionCall.method_name === "withdraw";
    },
  },
  {
    error: "An error occurred when applying the address in the allowlist",
    success: "The funds has been sent to the address.",
    methodName: "allowlist",
    check: ({ transaction: { actions } }: TransactionPayload) => {
      const [action] = actions;

      return action.FunctionCall.method_name === "allowlist";
    },
  },
];

export default actions;
