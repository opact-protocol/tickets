
import { mimc } from "@/services";
import { Currency } from "@/interfaces";
import { viewAccountHash } from "@/views";
import { getTransaction, randomBN, viewFunction } from "@/helpers";
import { WalletSelector } from "@near-wallet-selector/core";

export const createTicket = async (
  nodeRpcUrl: string,
  contract: string,
  accountId: string,
  currencieContract: string,
) => {
  const secret = randomBN();
  const nullifier = randomBN();

  const secrets_hash = mimc.hash!(secret, nullifier);

  const accountHash = await viewAccountHash(
    nodeRpcUrl,
    contract,
    accountId,
  );

  const contractHash = await viewAccountHash(
    nodeRpcUrl,
    contract,
    currencieContract,
  );

  //contract-secret-nullifier-account
  const note = `
    ${contractHash.toString()}-
    ${secret.toString()}-
    ${nullifier.toString()}-
    ${accountHash.toString()}
  `;

  return {
    note,
    hash: secrets_hash,
  };
}

export const sendDeposit = async(
  nodeUrl: string,
  hash: string,
  amount: string,
  contract: string,
  accountId: string,
  currency: Currency,
  connection: WalletSelector,
) => {
  const wallet = await connection.wallet();

  const transactions: any[] = [];

  if (currency.type === 'Nep141') {
    const tokenContract = currency.account_id || '';

    const storage = await getTokenStorage(
      tokenContract,
      contract,
      nodeUrl,
    );

		if (!storage || storage.total < '0.10') {
			transactions.push(
				getTransaction(
					accountId,
					tokenContract,
					'storage_deposit',
					{
						account_id: contract,
						registration_only: true,
					},
				),
			);
		}

    transactions.push(
      getTransaction(
        accountId,
        tokenContract,
        'ft_transfer_call',
        {
          amount,
          msg: hash,
          memo: null,
          receiver_id: contract,
        }
      )
    )
  }

  if (currency.type === 'Near') {
    transactions.push(
      getTransaction(
        accountId,
        contract,
        "deposit",
        {
          secrets_hash: hash,
        },
        amount,
      )
    );
  }

  wallet.signAndSendTransactions({
    transactions,
  });
}

export const getTokenStorage = async (
  token: string,
  contract: string,
  nodeRpcUrl: string,
) => {
  try {
    return await viewFunction(
      nodeRpcUrl,
      token,
      'storage_balance_of',
      {
        account_id: contract,
      }
    );
  } catch (e) {
    return;
  }
};
