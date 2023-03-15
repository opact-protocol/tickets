// @ts-nocheck
/* eslint-disable */

import { config } from './constant';
import { REPLACE_TOKENS } from './ref';
import metaIconDefaults from './metaIcons';

export const getTokens = async () => {
  return await fetch(config.indexerUrl + '/list-token', {
        method: 'GET',
        headers: { 'Content-type': 'application/json; charset=UTF-8' },
      })
        .then(res => res.json())
        .then((tokens: any) => {
          const newTokens = Object.values(tokens).reduce(
            (acc: any, cur: any, i) => {
              const id = Object.keys(tokens)[i];
              return {
                ...acc,
                [id]: {
                  ...cur,
                  id,
                  icon:
                    !cur.icon || REPLACE_TOKENS.includes(id)
                      ? metaIconDefaults[id]
                      : cur.icon,
                },
              };
            },
            {}
          );

          return newTokens;
        })
        .then(res => {
          return res;
        });
};
