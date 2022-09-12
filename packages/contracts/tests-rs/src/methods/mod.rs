use crate::*;

mod storage;
mod token;

pub use token::*;
pub use storage::*;

pub fn get_wasm(file_name: &str) -> Result<Vec<u8>, Error> {
  std::fs::read(Path::new(OUT_DIR).join(file_name))
}

pub async fn create_user_account(
  tla: &Account,
  worker: &Worker<impl DevNetwork>,
  account_id: &str,
) -> Account {
  tla
    .create_subaccount(worker, account_id)
    .initial_balance(USER_ACCOUNT_BALANCE)
    .transact()
    .await
    .unwrap()
    .unwrap()
}

pub async fn deploy_contract(
  tla: &Account,
  worker: &Worker<impl DevNetwork>,
  account_id: &str,
  wasm: &Vec<u8>,
) -> Contract {
  let contract_account = tla
    .create_subaccount(worker, account_id)
    .initial_balance(CONTRACT_ACCOUNT_BALANCE)
    .transact()
    .await
    .unwrap()
    .unwrap();

  contract_account
    .deploy(worker, wasm)
    .await
    .unwrap()
    .unwrap()
}

pub async fn spoon_contract(
  contract_id: &str,
  worker: &Worker<Sandbox>,
) -> anyhow::Result<Contract> {
  let mainnet = workspaces::mainnet_archival().await?;
  let contract_id: AccountId = contract_id.parse().unwrap();

  Ok(
    worker
      .import_contract(&contract_id, &mainnet)
      .initial_balance(parse_near!("1000000 N"))
      .block_height(SPOON_BLOCK_HEIGHT)
      .transact()
      .await?,
  )
}

pub async fn time_travel(worker: &Worker<Sandbox>, seconds_to_advance: u64) -> anyhow::Result<()> {
  let blocks_to_advance = (seconds_to_advance * TO_NANO) / AVERAGE_BLOCK_TIME;
  worker.fast_forward(blocks_to_advance).await?;
  anyhow::Ok(())
}
