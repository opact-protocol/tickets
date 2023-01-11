use crate::*;

pub async fn bulk_register_storage<>(
  worker: &Worker<Sandbox>,
  accounts: Vec<&Account>,
  contracts: Vec<&Contract>,
) -> anyhow::Result<()> {
  let mut batch = Vec::new();
  for account in accounts.into_iter() {
    for contract in contracts.iter() {
      batch.push(account
        .call(&worker, contract.id(), "storage_deposit")
        .args_json(json!({
          "account_id": account.id(),
          "registration_only": false,
        }))?
        .deposit(parse_near!("1 N"))
        .transact());
    }
  }
  try_join_all(batch).await?;
  anyhow::Ok(())
}
