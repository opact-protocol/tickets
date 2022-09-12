use crate::*;

pub async fn ft_transfer(
  worker: &Worker<Sandbox>,
  sender: &Account,
  contract: &Contract,
  receiver: &Account,
  amount: u128,
) -> anyhow::Result<()> {
  sender
    .call(&worker, contract.id(), "ft_transfer")
    .args_json(json!({
      "receiver_id": receiver.id(),
      "amount": amount.to_string(),
      "memo": null,
    }))?
    .deposit(1)
    .gas(GAS_LIMIT)
    .transact()
    .await?;
  anyhow::Ok(())
}

pub async fn ft_transfer_call(
  worker: &Worker<Sandbox>,
  sender: &Account,
  contract: &Contract,
  receiver: &Account,
  amount: u128,
  msg: String,
) -> anyhow::Result<()> {
  let result = sender
    .call(&worker, contract.id(), "ft_transfer_call")
    .args_json(json!({
      "receiver_id": receiver.id(),
      "amount": amount.to_string(),
      "memo": null,
      "msg": msg
    }))?
    .deposit(1)
    .gas(GAS_LIMIT)
    .transact()
    .await?;
  println!("{:#?}", result.outcomes());

  anyhow::Ok(())
}

pub async fn ft_balance_of(
  worker: &Worker<Sandbox>,
  contract: &Contract,
  account: &Account,
) -> anyhow::Result<String> {
  anyhow::Ok(
    contract
      .view(
        worker,
        "ft_balance_of",
        json!({
          "account_id": account.id()
        })
        .to_string()
        .into_bytes(),
      )
      .await?
      .json()?,
  )
}

pub async fn initialize_ft_contract(
  worker: &Worker<impl DevNetwork>,
  contract: &Contract,
  owner: &Account,
) -> workspaces::result::CallExecutionDetails {
  contract
    .call(&worker, "new")
    .args_json(json!({
      "owner_id": owner.id(),
      "total_supply": "1000000000000000000000",
      "metadata": {
          "spec": "ft-1.0.0",
          "name": "name",
          "symbol": "NME",
          "icon": null,
          "reference": null,
          "reference_hash": null,
          "decimals": FT_DECIMALS,
      }
    }))
    .unwrap()
    .transact()
    .await
    .unwrap()
}
