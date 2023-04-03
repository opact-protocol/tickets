import { Env } from "./env";
import { consumer } from "./consumer";
import { QueuedData } from "./utils";

export { Pagination } from "./graphql";

const durableObjecId = "HYC";

export default {
  scheduled: async (event: Event, env: Env, ctx: ExecutionContext) => {
    const id = env.DURABLE.idFromName(durableObjecId);
    const stub = env.DURABLE.get(id);
    const request = new Request("dummyurl");
    try {
      await stub.fetch(request);
    } catch (err) {
      console.log(
        "execution failed during durable object request, error: ",
        err
      )
    }
  },
  queue: async (batch: MessageBatch<QueuedData>, env: Env): Promise<void> => {
    for (const message of batch.messages) {
      consumer(message.body, env);
    }
  }
};
