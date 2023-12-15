import { decode } from 'js-base64';
import { babyjub, poseidon } from 'circomlibjs';
import { decrypt as _decrypt } from '@metamask/eth-sig-util';

export const isPrefixed0x = (str: string): boolean => str.startsWith('0x');

export const strip0x = (str: string): string => (isPrefixed0x(str) ? str.slice(2) : str);

export const deriveBabyJubKeysFromEth = (wallet: any) => {
  const adjustedPrivateKey = BigInt(wallet.pvtkey) % babyjub.subOrder;

  const pubkey = babyjub.mulPointEscalar(babyjub.Base8, adjustedPrivateKey)[0];

  return {
    pubkey,
    pvtkey: adjustedPrivateKey,
  };
}

export const ownerCommit = ({ pubkey, blinding }: any) => poseidon([pubkey, blinding]);

export const utxoHash = ({ token, amount, pubkey, blinding }: any) => outUtxoInputs({ token, amount, pubkey, blinding })

export const outUtxoInputs = ({ token, amount, pubkey, blinding }: any) => poseidon([token, amount, ownerCommit({pubkey, blinding})]);

export const parseUtxoString = (utxo: string) => {
  const {
    id,
    hash,
    token,
    amount,
    pubkey,
    receipt,
    address,
    blinding,
  } = JSON.parse(utxo)

  return {
    id,
    receipt,
    address,
    hash: BigInt(hash),
    token: BigInt(token),
    amount: BigInt(amount),
    pubkey: BigInt(pubkey),
    blinding: BigInt(blinding),
  }
}

export const decrypt = ({ encrypted, privateKey, isUtxo = true }: any) => {
  const decodedEncrypted = decode(encrypted)

  const encryptedData = JSON.parse(decodedEncrypted)

  const decrypted = _decrypt({
    encryptedData,
    privateKey: strip0x(privateKey),
  })

  if (isUtxo) {
    return parseUtxoString(decrypted)
  }

  return JSON.parse(decrypted)
}

export const getNullifier = ({ utxo, secret }: any) => poseidon([secret, utxoHash(utxo)])

export const getUserBalanceBySecret = async (
  config: any,
  secret: any,
  currentId: any,
  storedUtxos: any,
) => {
  let lastId = currentId

  let isLastPage = false

  let encrypted: any[] = []

  while (!isLastPage) {
    const response = await fetch(`${config.indexerUrl}/encrypted?salt=${currentId as string}`)

    const {
      data,
      last_tx_id,
      is_last_page
    } = await response.json()

    encrypted = [...encrypted, ...data]

    isLastPage = is_last_page

    if (isLastPage) {
      lastId = last_tx_id
    }
  }

  let nullifierIsLastPage = false

  let nullifiers: any[] = []

  while (!nullifierIsLastPage) {
    const response = await fetch(`${config.indexerUrl}/nullifiers`)

    const {
      data,
      is_last_page
    } = await response.json()

    nullifiers = [...nullifiers, ...data]

    nullifierIsLastPage = is_last_page
  }

  const decrypted: any[] = []
  const encryptedUtxos: any[] = []

  encrypted.forEach((item: any) => {
    if (storedUtxos.includes(item)) {
      return
    }

    try {
      const value = decrypt({
        encrypted: item,
        privateKey: secret,
      })

      decrypted.push(value)
      encryptedUtxos.push(item)
    } catch (e) {
      return null
    }
  })

  storedUtxos.forEach((item: any) => {
    try {
      const value = decrypt({
        encrypted: item,
        privateKey: secret,
      })

      decrypted.push(value)
      encryptedUtxos.push(item)
    } catch (e) {
      return null
    }
  })

  return {
    lastId,
    encryptedUtxos,
    ...groupUtxoByToken([...decrypted], nullifiers, secret)
  }
}

export const groupUtxoByToken = (encrypted: any, nullifiers: any, secret: any) => {
  return encrypted.reduce((acc: any, curr: any) => {
    const derivedKeys = deriveBabyJubKeysFromEth({ pvtkey: secret })

    const nullifier = getNullifier({
      utxo: curr,
      secret: derivedKeys.pvtkey
    })

    const isOnUtxos = acc.utxos.find((value: any) => {
      return value.blinding === curr.blinding
    })

    if (curr.receipt) {
      acc.receipts.push(curr.receipt)
    }

    if (nullifiers.includes(nullifier.toString()) || curr.amount === 0n || !!isOnUtxos) {
      return acc
    }

    acc.utxos.push(curr)

    const {
      token,
      address,
    } = curr

    if (!acc.treeBalances[address]) {
      acc.treeBalances[address] = {
        token,
        address,
        utxos: [],
        balance: 0n,
      }
    }

    acc.treeBalances[address].balance += curr.amount
    acc.treeBalances[address].utxos = [...acc.treeBalances[address].utxos, curr]

    return acc
  }, {
    utxos: [],
    receipts: [],
    treeBalances: {},
  })
}

