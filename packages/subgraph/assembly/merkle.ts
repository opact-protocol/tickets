import { BigInt, json, JSONValue, log } from "@graphprotocol/graph-ts";
import {
  DepositMerkleTreeUpdate,
  AllowlistMerkleTreeUpdate,
} from "../generated/schema";

export function handleDeposit(
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

    if (!eventType || eventType.isNull() || eventType.toString() != "deposit")
      continue;

    if (eventData) {
      const eventArray: JSONValue[] = eventData.toArray();

      const data = eventArray[0].toObject();
      const counter = data.get("counter");
      const index = data.get("index");
      const value = data.get("value");

      if (!index || !value || !counter) continue;

      const depositEvent = new DepositMerkleTreeUpdate(
        counter.toU64().toString()
      );
      depositEvent.counter = BigInt.fromU64(counter.toU64());
      depositEvent.contract = contract;
      depositEvent.signer = signer;
      depositEvent.index = BigInt.fromString(index.toString());
      depositEvent.value = value.toString();
      depositEvent.timestamp = BigInt.fromU64(timestamp);
      depositEvent.save();
    }
  }
}

export function handleAllowlist(
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
      eventType.toString() != "updated_allowlist"
    )
      continue;

    if (eventData) {
      const eventArray: JSONValue[] = eventData.toArray();

      const data = eventArray[0].toObject();
      const counter = data.get("counter");
      const index = data.get("index");
      const value = data.get("value");
      const account = data.get("account");
      const allowed = data.get("allowed");

      if (!index || !value || !counter || !account || !allowed) continue;

      const allowlistEvent = new AllowlistMerkleTreeUpdate(
        counter.toU64().toString()
      );
      allowlistEvent.counter = BigInt.fromU64(counter.toU64());
      allowlistEvent.contract = contract;
      allowlistEvent.signer = signer;
      allowlistEvent.index = BigInt.fromString(index.toString());
      allowlistEvent.value = value.toString();
      allowlistEvent.account = account.toString();
      allowlistEvent.allowed = allowed.toBool();
      allowlistEvent.timestamp = BigInt.fromU64(timestamp);
      allowlistEvent.save();
    }
  }
}
