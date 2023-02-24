#[cfg(test)]
mod tests {

  use core::panic;

  use crate::*;

  /// Integration tests
  /// aims to test full aplication flow
  /// 0. initialize contracts
  /// 1. commit deposits
  /// 2. attempt to withdraw with wrong proofs - assert fail
  /// 3. withdraw with correct proofs
  #[tokio::test]
  async fn test_near_flow() -> anyhow::Result<()> {
    let worker: Worker<Sandbox> = workspaces::sandbox().await?;

    let root = worker.root_account().unwrap();

    // 0. Initialize accounts
    // CREATE USER ACCOUNTS
    let owner = create_user_account(&root, &worker, "owner").await;
    let user = create_user_account(&root, &worker, "user").await;
    let user2 = create_user_account(&root, &worker, "user2").await;
    let user3 = create_user_account(&root, &worker, "user3").await;
    let user4 = create_user_account(&root, &worker, "user4").await;
    let non_registered_user = create_user_account(&root, &worker, "non_registered_user").await;
    // SPOON HAPI.ONE FROM MAINNET
    let hapi_one_account: &str = "proxy.hapiprotocol.near";

    let hapi_one = spoon_contract(hapi_one_account, &worker).await?;

    owner
      .call(&worker, hapi_one.id(), "new")
      .args_json(json!({
        "owner_id": owner.id()
      }))?
      .gas(300000000000000)
      .transact()
      .await?;

    // 1. Initialize contract
    // DEPLOY REGISTRY CONTRACT
    let registry_wasm = get_wasm("registry.wasm")?;
    let registry = deploy_contract(&root, &worker, "registry_contract", &registry_wasm).await;

    // DEPLOY INSTANCE CONTRACT
    let contract_wasm = get_wasm("instance.wasm")?;
    let contract = deploy_contract(&root, &worker, "core_contract", &contract_wasm).await;

    const DEPOSIT_VALUE: u128 = 10_000_000_000_000_000_000_000_000;
    /// fee should be 10% for tests
    const OWNER_FEE: u128 = 10_000;
    /// same as contract constante
    const FEE_DIVISOR: u128 = 100_000;
    /// calculated fee value
    const FEE_VALUE: u128 = (DEPOSIT_VALUE * OWNER_FEE) / FEE_DIVISOR;
    /// calculated withdraw value
    const WITHDRAW_VALUE: u128 = DEPOSIT_VALUE - FEE_VALUE;

    let vk = get_json("verification_key.json").unwrap();

    let commitment1 = get_json("commitment1.json").unwrap();
    let commitment2 = get_json("commitment2.json").unwrap();
    let commitment3 = get_json("commitment3.json").unwrap();
    let commitment4 = get_json("commitment4.json").unwrap();

    // INITIALIZE REGISTRY
    initialize_registry(&worker, &registry, &owner, hapi_one.as_account(), vec![]).await?;

    // INITIALIZE CONTRACT
    initialize_hyc(
      &worker,
      &contract,
      &owner,
      registry.as_account(),
      None,
      DEPOSIT_VALUE,
      OWNER_FEE,
      vk,
    )
    .await?;

    // 0. add to allowlist
    allowlist(&worker, &registry, &owner, &user).await?;
    allowlist(&worker, &registry, &owner, &user2).await?;
    allowlist(&worker, &registry, &owner, &user3).await?;
    allowlist(&worker, &registry, &owner, &user4).await?;

    // 1. commit deposits

    // assert deposit without registration fails
    let should_fail = deposit_near(
      &worker,
      &contract,
      &non_registered_user,
      commitment1["secret_hash"].clone(),
      DEPOSIT_VALUE,
    )
    .await;
    match should_fail {
      Ok(_) => panic!("should fail"),
      Err(_) => (),
    }

    // assert deposit without registration fails
    let should_fail = deposit_near(
      &worker,
      &contract,
      &non_registered_user,
      commitment1["secret_hash"].clone(),
      DEPOSIT_VALUE,
    )
    .await;
    match should_fail {
      Ok(_) => panic!("should fail"),
      Err(_) => (),
    }

    // assert wrong deposit fails
    let should_fail = deposit_near(
      &worker,
      &contract,
      &user,
      commitment1["secret_hash"].clone(),
      DEPOSIT_VALUE - 1,
    )
    .await;
    match should_fail {
      Ok(_) => panic!("should fail"),
      Err(_) => (),
    }

    // make correct deposits
    deposit_near(
      &worker,
      &contract,
      &user,
      commitment1["secret_hash"].clone(),
      DEPOSIT_VALUE,
    )
    .await?;
    deposit_near(
      &worker,
      &contract,
      &user2,
      commitment2["secret_hash"].clone(),
      DEPOSIT_VALUE,
    )
    .await?;
    deposit_near(
      &worker,
      &contract,
      &user3,
      commitment3["secret_hash"].clone(),
      DEPOSIT_VALUE,
    )
    .await?;
    deposit_near(
      &worker,
      &contract,
      &user3,
      commitment4["secret_hash"].clone(),
      DEPOSIT_VALUE,
    )
    .await?;

    // assert correct proofs

    // user 1 deposits -> user 1 withdraws to user4
    let proof1 = get_json("proof1.json").unwrap();
    let public1 = get_json("public1.json").unwrap();

    let initial_balance = user4.view_account(&worker).await?.balance;
    let initial_balance_owner = owner.view_account(&worker).await?.balance;

    withdraw(
      &worker,
      &contract,
      &user,
      None,
      &user4,
      public1.clone(),
      proof1.clone(),
    )
    .await?;

    let final_balance = user4.view_account(&worker).await?.balance;
    let final_balance_owner = owner.view_account(&worker).await?.balance;

    assert_eq!(initial_balance + WITHDRAW_VALUE, final_balance);
    assert_eq!(initial_balance_owner + FEE_VALUE, final_balance_owner);

    // assert proof cannot be used again
    let should_panic = withdraw(
      &worker,
      &contract,
      &user,
      None,
      &user4,
      public1.clone(),
      proof1.clone(),
    )
    .await;

    match should_panic {
      Ok(_) => panic!("should panic"),
      Err(_) => (),
    }

    // user 2 deposits -> user1 withdraws as relayer to user4 withdraws
    let proof2 = get_json("proof2.json").unwrap();
    let public2 = get_json("public2.json").unwrap();

    let initial_balance1 = user.view_account(&worker).await?.balance;
    let initial_balance4 = user4.view_account(&worker).await?.balance;
    let initial_balance_owner = owner.view_account(&worker).await?.balance;

    withdraw(
      &worker,
      &contract,
      &user2,
      Some(user.id().to_string()),
      &user4,
      public2.clone(),
      proof2.clone(),
    )
    .await?;

    let final_balance1 = user.view_account(&worker).await?.balance;
    let final_balance4 = user4.view_account(&worker).await?.balance;
    let final_balance_owner = owner.view_account(&worker).await?.balance;

    assert_eq!(
      initial_balance1 + public2[4].as_str().unwrap().parse::<u128>().unwrap(),
      final_balance1
    );
    assert_eq!(
      initial_balance4 + WITHDRAW_VALUE - public2[4].as_str().unwrap().parse::<u128>().unwrap(),
      final_balance4
    );
    assert_eq!(initial_balance_owner + FEE_VALUE, final_balance_owner);

    anyhow::Ok(())
  }
}
