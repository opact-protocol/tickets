import pg from 'pg';

const CONTRACT_ACCOUNT_ID = 'hycatnear.testnet';

const transactionsQuery = `
select r.receipt_id, r.predecessor_account_id, t.transaction_hash
from receipts r, action_receipt_actions ara, transactions t
where r.receiver_account_id = '${CONTRACT_ACCOUNT_ID}'
  and ara.receipt_id = r.receipt_id
  and ara.action_kind = 'FUNCTION_CALL'             
  and t.transaction_hash = r.originated_from_transaction_hash
`;

const allowCors = fn => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  // another common pattern
  // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  return await fn(req, res)
}

async function queryHandler(request, response) {
  console.log('eh nois');

  const explorerClient = new pg.Client({
    host: 'testnet.db.explorer.indexer.near.dev',
    user: 'public_readonly',
    password: 'nearprotocol',
    database: 'testnet_explorer',
  });

  await explorerClient.connect();

  console.log('tamo vivo');

  const result = (await explorerClient.query(transactionsQuery)).rows;

  console.log({ result })

  response.status(200).json({ body: result });
}

export default allowCors(queryHandler);
