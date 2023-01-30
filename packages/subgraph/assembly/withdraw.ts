import { BigInt, near, json, JSONValue, log } from "@graphprotocol/graph-ts";
import { Withdrawal } from "../generated/schema";

export function handleWithdrawal(
  contract: string,
  signer: string,
  timestamp: u64,
  logs: Array<string>
): void {
  // return if no events were emitted
  if (logs.length == 0) return;

  for (let logIndex = 0; logIndex < logs.length; logIndex++) {
    const outcomeLog = logs[logIndex].toString();
    const parsed = outcomeLog.replace("EVENT_JSON:", "");
    const jsonData = json.try_fromString(parsed);
    const jsonObject = jsonData.value.toObject();
    const eventType = jsonObject.get("event");
    const eventData = jsonObject.get("data");

    if (
      !eventType ||
      eventType.isNull() ||
      eventType.toString() != "withdrawal"
    )
      continue;

    if (eventData) {
      const eventArray: JSONValue[] = eventData.toArray();

      const data = eventArray[0].toObject();
      const counter = data.get("counter");
      const recipient = data.get("recipient");
      const relayer = data.get("relayer");
      const fee = data.get("fee");
      const refund = data.get("refund");
      const nullifier = data.get("nullifier");

      if (!recipient || !fee || !refund || !nullifier || !counter) continue;

      let relayerValue: string | null;
      if (relayer) {
        relayerValue = relayer.isNull() ? null : relayer.toString();
      } else {
        relayerValue = null;
      }

      const withdrawalEvent = new Withdrawal(counter.toU64().toString());
      withdrawalEvent.contract = contract;
      withdrawalEvent.signer = signer;
      withdrawalEvent.relayer = relayerValue;
      withdrawalEvent.recipient = recipient.toString();
      withdrawalEvent.fee = BigInt.fromString(fee.toString());
      withdrawalEvent.nullifier = nullifier.toString();
      withdrawalEvent.timestamp = BigInt.fromU64(timestamp);
      withdrawalEvent.save();
    }
  }
}
