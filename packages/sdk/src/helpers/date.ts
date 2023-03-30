/**
 * Helpers: Get UTC Date
 *
 * This method is responsible for returning a new UTC date.
 *
 * @param timestamp the valid date in miliseconds
 * @returns {Promise<Date>}
 */
export const getUTCDate = (timestamp: number = Date.now()): Date => {
  const date = new Date(timestamp);

  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  );
};
