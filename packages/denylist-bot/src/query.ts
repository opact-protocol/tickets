export const paginationSize = 100;

export const getHapioneEntriesQuery = `
  query GetHapioneEntries($lastViewed: BigInt!) {
    hapioneEntries(where: {counter_gt: $lastViewed}, first: ${paginationSize}, orderBy: counter) {
      counter
      account
      category
      risk
    }
  }
`;
