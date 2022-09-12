use crate::*;

mod share_token;
mod storage;
mod token;

pub use share_token::*;
pub use storage::*;
pub use token::*;

pub fn get_wasm(file_name: &str) -> Result<Vec<u8>, Error> {
    std::fs::read(Path::new(OUT_DIR).join(file_name))
}

pub fn get_json(file_name: &str) -> Option<serde_json::Value> {
  let path = Path::new(PROOF_DIR).join(file_name);
  if path.exists() {
    let data = std::fs::read_to_string(path).unwrap();
    Some(serde_json::from_str(&data).unwrap())
  } else {
    None
  }
  
}

pub async fn create_user_account(
    tla: &Account,
    worker: &Worker<impl DevNetwork>,
    account_id: &str,
) -> Account {
    tla.create_subaccount(worker, account_id)
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

pub async fn time_travel(worker: &Worker<Sandbox>, seconds_to_advance: u64) -> anyhow::Result<()> {
    let blocks_to_advance = (seconds_to_advance * TO_NANO) / AVERAGE_BLOCK_TIME;
    worker.fast_forward(blocks_to_advance).await?;
    anyhow::Ok(())
}
