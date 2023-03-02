import BN from 'bn.js';
import randombytes from 'randombytes';

export function leInt2Buff(value: any) {
  return new BN(value, 16, "le");
}

export function randomBN(nbytes = 31) {
  //@ts-ignore
  return toBN(leInt2Buff(randombytes(nbytes)).toString());
}

export const toBN = (number: number | string) => {
  try {
    return numberToBN(number);
  } catch(e) {
    throw new Error(e + ' Given value: "'+ number +'"');
  }
};

export const numberToBN = (arg: any) => {
  if (typeof arg === 'string' || typeof arg === 'number') {
    let multiplier = new BN(1); // eslint-disable-line
    const formattedString = String(arg).toLowerCase().trim();
    const isHexPrefixed = formattedString.substr(0, 2) === '0x' || formattedString.substr(0, 3) === '-0x';
    let stringArg = stripHexPrefix(formattedString); // eslint-disable-line
    if (stringArg.substr(0, 1) === '-') {
      stringArg = stripHexPrefix(stringArg.slice(1));
      multiplier = new BN(-1, 10);
    }
    stringArg = stringArg === '' ? '0' : stringArg;

    if ((!stringArg.match(/^-?[0-9]+$/) && stringArg.match(/^[0-9A-Fa-f]+$/))
      || stringArg.match(/^[a-fA-F]+$/)
      || (isHexPrefixed === true && stringArg.match(/^[0-9A-Fa-f]+$/))) {
      return new BN(stringArg, 16).mul(multiplier);
    }

    if ((stringArg.match(/^-?[0-9]+$/) || stringArg === '') && isHexPrefixed === false) {
      return new BN(stringArg, 10).mul(multiplier);
    }
  } else if (typeof arg === 'object' && arg.toString && (!arg.pop && !arg.push)) {
    if (arg.toString(10).match(/^-?[0-9]+$/) && (arg.mul || arg.dividedToIntegerBy)) {
      return new BN(arg.toString(10), 10);
    }
  }
}

export const stripHexPrefix = (str: string) => {
  if (typeof str !== 'string') {
    return str;
  }

  return isHexPrefixed(str) ? str.slice(2) : str;
}

export const isHexPrefixed = (str: string) => {
  if (typeof str !== 'string') {
    throw new Error("[is-hex-prefixed] value must be type 'string', is currently type " + (typeof str) + ", while checking isHexPrefixed.");
  }

  return str.slice(0, 2) === '0x';
}
