import Big from "big.js";
import { Env } from "./env";

const paginationSize = 100;

type FeederState = string | null;

export class Pagination {
    state: FeederState;
    env: Env;
    constructor(state: FeederState, env: Env) {
        this.state = state;
        this.env = env;
    }

    async fetch(request: Request) {
        const state = this.state || "0";
        const env = this.env;

        const query = `
            query GetHapioneEntries($lastViewed: BigInt!) {
                hapioneEntries(where: {counter_gte: $lastViewed}, first: ${paginationSize}, orderBy: counter) {
                    id
                    counter
                    account
                    category
                    risk
                }
            }
        `;

        const variables = {
            lastViewed: state
        }

        const response = await fetch(env.GRAPHQL_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ query, variables }),
        });

        const { data, errors } = (await response.json()) as { data: any[], errors: any };
        
        // if error is thrown, exit execution
        if (errors) throw new Error(JSON.stringify(errors));

        // sends all items collected in batch to queue
        await env.QUEUE.sendBatch(data);

        // updates state to new last read item
        this.state = (new Big(state).plus(data.length)).toFixed(0);

        // returns success response
        return new Response("Success!");
    }
}