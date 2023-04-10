import { Env } from "./types/env";
import { consumer } from "./services/consumer";
import { QueuedData } from "./types/pagination";

export { Pagination } from "./dos/pagination";

const durableObjecId = "HYC";

export default {
  scheduled: async (_: any, env: Env) => {
    const id = env.DURABLE.idFromName(durableObjecId);

    const stub = env.DURABLE.get(id);

    try {
      await stub.fetch(env.GRAPHQL_URL);
    } catch (err) {
      console.warn(
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
