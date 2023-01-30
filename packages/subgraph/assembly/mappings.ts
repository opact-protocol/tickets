import { near, log } from "@graphprotocol/graph-ts";

import { handleDeposit, handleAllowlist } from "./merkle";
import { handleWithdrawal } from "./withdraw";

export function handleReceipt(receipt: near.ReceiptWithOutcome): void {
  const actions = receipt.receipt.actions;
  log.debug("handleReceipt. actions len: {}", [actions.length.toString()]);
  for (let i = 0; i < actions.length; i++) {
    handleAction(actions[i], receipt);
  }
}

function handleAction(
  action: near.ActionValue,
  receiptWithOutcome: near.ReceiptWithOutcome
): void {
  if (action.kind != near.ActionKind.FUNCTION_CALL) {
    return;
  }
  const logs = receiptWithOutcome.outcome.logs;
  const functionCall = action.toFunctionCall();
  const methodName = functionCall.methodName;
  const contractAddress = receiptWithOutcome.receipt.receiverId;
  const signer = receiptWithOutcome.receipt.signerId;
  const timestamp: u64 = receiptWithOutcome.block.header.timestampNanosec;

  if (methodName == "withdraw") {
    handleWithdrawal(contractAddress, signer, timestamp, logs);
  } else if (methodName == "deposit") {
    handleDeposit(contractAddress, signer, timestamp, logs);
  } else if (
    methodName == "allowlist_callback" ||
    methodName == "denylist_callback"
  ) {
    handleAllowlist(contractAddress, signer, timestamp, logs);
  }
}
