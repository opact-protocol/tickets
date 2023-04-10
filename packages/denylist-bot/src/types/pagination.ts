export type FeederState = string | undefined;

export type QueuedData = {
  counter: string;
  account: string;
  category: string;
  risk: string;
}

export type GraphqlResponse = {
  hapioneEntries: QueuedData[];
}

export interface FetchResponseInterface { data: GraphqlResponse, errors: any }
