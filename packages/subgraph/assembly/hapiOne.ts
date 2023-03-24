import { BigInt, json, JSONValue, log, near } from "@graphprotocol/graph-ts";
import {
    HapioneEntry,
    HapioneControl
} from "../generated/schema";

export function handleHapiOne(
    functionCall: near.FunctionCallAction
): void {

    let control = HapioneControl.load("unique");
    if (!control) {
        control = new HapioneControl("unique");
        control.counter = BigInt.fromU32(0);
        control.save()
    }

    const params = json.fromBytes(functionCall.args).toObject();

    const hapiEvent = new HapioneEntry(
        control.counter.toString()
    );
    hapiEvent.counter = control.counter;
    hapiEvent.account = params.mustGet("address").toString();
    hapiEvent.category = params.mustGet("category").toString();
    hapiEvent.risk = params.mustGet("risk").toBigInt();
    hapiEvent.save();

    control.counter = control.counter.plus(BigInt.fromU32(1));
    control.save();

}