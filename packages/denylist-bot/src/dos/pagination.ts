import { Env } from "../types/env";
import { FeederState } from "../types/pagination";
import { sendRequest } from "../services/request";

/**
 * The Durable Object
 */
export class Pagination {
  env: Env;
  durable: DurableObjectState;

  /** constructor
   * The constructor of durable object
   * @param state The durable feeder state
   * @param env The env object
   * @returns void
   */
  constructor(durable: DurableObjectState, env: Env) {
    this.env = env;
    this.durable = durable;
  }

  /** getCurrentCounter
   * This function returns the feeder state.
   * @returns The current feeder state
   */
  async getCurrentCounter (): Promise<FeederState> {
    return await this.durable.storage.get<FeederState>('counter') || '0';
  }

  /** updateCurrentCounter
   * This function update the feeder state.
   * @param counter The new feeder state value
   * @returns void
   */
  async updateCurrentCounter (counter: FeederState): Promise<void> {
    return await this.durable.storage.put('counter', counter);
  }

  /** fetch
   * This function gets the last 100 entries from Hapi-One since the last counter and send to be processed for queue.
   * @param request The request object
   * @returns The response with an success value
   */
  async fetch() {
    const currentState = await this.getCurrentCounter();

    console.info(`Fetching new Happi-one entries of counter: ${currentState}`);

    const {
      data: {
        hapioneEntries,
      },
      errors,
    } = await sendRequest(currentState, this.env);

    if (hapioneEntries.length <= 0) {
      console.info(`The fetch for counter: ${currentState} returns a empty value`);

      return new Response("Success!");
    }

    if (errors) {
      throw new Error(JSON.stringify(errors))
    }

    await this.env.QUEUE.sendBatch(hapioneEntries.map(value => ({ body: value})) as any);

    const lastEntry = hapioneEntries.at(-1);

    const nextIndexOf = lastEntry
      ? +lastEntry.counter + 1 + ''
      : '0';

    await this.updateCurrentCounter(nextIndexOf);

    return new Response("Success!");
  }
}
