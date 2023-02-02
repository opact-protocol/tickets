import { TransactionPayload } from "./tools/modules/near";

export interface Actionable {
  error: string;
  success: string;
  check: ({ transaction: { actions } }: TransactionPayload) => boolean;
}

export const actions = [
  {
    error: "Something went wrong :(",
    success: "Tokens sent succesfully",
    methodName: "deposit",
    check: ({ transaction: { actions } }: TransactionPayload) => {
      const [action] = actions;

      return action.FunctionCall.method_name === "deposit";
    },
  },
];

export default actions;
