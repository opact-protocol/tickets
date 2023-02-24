#[cfg(test)]
mod tests {

  use core::panic;

  use crate::*;

  /// Integration tests
  /// aims to test full aplication flow
  /// 0. initialize contract
  /// 1. commit deposits
  /// 2. attempt to withdraw with wrong proofs - assert fail
  /// 3. withdraw with correct proofs
  #[tokio::test]
  async fn test_nep141_flow() -> anyhow::Result<()> {
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

    // DEPLOY TOKEN CONTRACT
    let token_wasm = get_wasm("fungible_token.wasm")?;
    let token = deploy_contract(&root, &worker, "token_contract", &token_wasm).await;

    initialize_ft_contract(&worker, &token, &owner).await;

    // 1. Initialize contract
    // DEPLOY REGISTRY CONTRACT
    let registry_wasm = get_wasm("registry.wasm")?;
    let registry = deploy_contract(&root, &worker, "registry_contract", &registry_wasm).await;

    // DEPLOY INSTANCE CONTRACT
    let contract_wasm = get_wasm("contract.wasm")?;
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
      Some(token.as_account()),
      DEPOSIT_VALUE,
      OWNER_FEE,
      vk,
    )
    .await?;

    // INITIALIZE STORAGE AND GET INITIAL BALANCE TO USERS
    bulk_register_storage(
      &worker,
      vec![&user, &user2, &user3, &non_registered_user, contract.as_account()],
      vec![&token],
    )
    .await?;
    ft_transfer(&worker, &owner, &token, &user, DEPOSIT_VALUE * 10).await?;
    ft_transfer(&worker, &owner, &token, &user2, DEPOSIT_VALUE * 10).await?;
    ft_transfer(&worker, &owner, &token, &user3, DEPOSIT_VALUE * 10).await?;
    ft_transfer(&worker, &owner, &token, &non_registered_user, DEPOSIT_VALUE * 10).await?;

    // 0. add to allowlist
    allowlist(&worker, &registry, &owner, &user).await?;
    allowlist(&worker, &registry, &owner, &user2).await?;
    allowlist(&worker, &registry, &owner, &user3).await?;
    allowlist(&worker, &registry, &owner, &user4).await?;

    // 1. commit deposits
    // assert wrong deposit fails (depositing NEAR instead of token)
    let should_fail = deposit_near(&worker, &contract, &user, commitment1["secret_hash"].clone(), DEPOSIT_VALUE).await;
    match should_fail {
      Ok(_) => panic!("should fail"),
      Err(_) => (),
    }

    // assert wrong deposit fails (depositing wrong quantity instead of token)
    let should_fail = ft_transfer_call(
      &worker,
      &user,
      &token,
      contract.as_account(),
      DEPOSIT_VALUE - 1,
      commitment1["secret_hash"].as_str().unwrap().to_string(),
    )
    .await?;

    assert!(
      !is_cross_contract_full_success(should_fail),
      "call should have failed"
    );

    // assert deposit from non registered users fail
    let should_fail = ft_transfer_call(
      &worker,
      &non_registered_user,
      &token,
      contract.as_account(),
      DEPOSIT_VALUE,
      commitment1["secret_hash"].as_str().unwrap().to_string(),
    )
    .await?;

    assert!(
      !is_cross_contract_full_success(should_fail),
      "call should have failed"
    );

    // make correct deposits
    ft_transfer_call(
      &worker,
      &user,
      &token,
      contract.as_account(),
      DEPOSIT_VALUE,
      commitment1["secret_hash"].as_str().unwrap().to_string(),
    )
    .await?;

    ft_transfer_call(
      &worker,
      &user2,
      &token,
      contract.as_account(),
      DEPOSIT_VALUE,
      commitment2["secret_hash"].as_str().unwrap().to_string(),
    )
    .await?;

    ft_transfer_call(
      &worker,
      &user3,
      &token,
      contract.as_account(),
      DEPOSIT_VALUE,
      commitment3["secret_hash"].as_str().unwrap().to_string(),
    )
    .await?;

    ft_transfer_call(
      &worker,
      &user3,
      &token,
      contract.as_account(),
      DEPOSIT_VALUE,
      commitment4["secret_hash"].as_str().unwrap().to_string(),
    )
    .await?;

    // assert correct proofs

    // user2 deposits -> user 1 attempts to withdraw to user4
    // since user4 is not yet registered in token contract
    // everything should revert
    let proof2 = get_json("proof2.json").unwrap();
    let public2 = get_json("public2.json").unwrap();

    let initial_balance_contract = ft_balance_of(&worker, &token, contract.as_account()).await?;
    let initial_balance1 = ft_balance_of(&worker, &token, &user).await?;
    let initial_balance4 = ft_balance_of(&worker, &token, &user4).await?;
    let initial_balance_owner = ft_balance_of(&worker, &token, &owner).await?;

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

    let final_balance_contract = ft_balance_of(&worker, &token, contract.as_account()).await?;
    let final_balance1 = ft_balance_of(&worker, &token, &user).await?;
    let final_balance4 = ft_balance_of(&worker, &token, &user4).await?;
    let final_balance_owner = ft_balance_of(&worker, &token, &owner).await?;

    assert_eq!(initial_balance_contract, final_balance_contract);
    assert_eq!(initial_balance1, final_balance1);
    assert_eq!(initial_balance4, final_balance4);
    assert_eq!(initial_balance_owner, final_balance_owner);

    // user 2 deposits -> user1 withdraws as relayer to user4 withdraws
    // now call should go through since user4 has been registered
    bulk_register_storage(&worker, vec![&user4], vec![&token]).await?;

    let proof2 = get_json("proof2.json").unwrap();
    let public2 = get_json("public2.json").unwrap();

    let initial_balance1 = ft_balance_of(&worker, &token, &user).await?;
    let initial_balance4 = ft_balance_of(&worker, &token, &user4).await?;
    let initial_balance_owner = ft_balance_of(&worker, &token, &owner).await?;

    println!("A");
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

    let final_balance1 = ft_balance_of(&worker, &token, &user).await?;
    let final_balance4 = ft_balance_of(&worker, &token, &user4).await?;
    let final_balance_owner = ft_balance_of(&worker, &token, &owner).await?;

    assert_eq!(
      initial_balance1 + public2[4].as_str().unwrap().parse::<u128>().unwrap(),
      final_balance1
    );
    assert_eq!(
      initial_balance4 + WITHDRAW_VALUE - public2[4].as_str().unwrap().parse::<u128>().unwrap(),
      final_balance4
    );
    assert_eq!(initial_balance_owner + FEE_VALUE, final_balance_owner);

    // user 1 deposits -> user 1 withdraws to user4
    let proof1 = get_json("proof1.json").unwrap();
    let public1 = get_json("public1.json").unwrap();

    let initial_balance = ft_balance_of(&worker, &token, &user4).await?;
    let initial_balance_owner = ft_balance_of(&worker, &token, &owner).await?;

    println!("B");
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

    let final_balance = ft_balance_of(&worker, &token, &user4).await?;
    let final_balance_owner = ft_balance_of(&worker, &token, &owner).await?;

    println!(
      "initial_balance: {}, final_balance: {}",
      initial_balance, final_balance
    );

    assert_eq!(initial_balance + WITHDRAW_VALUE, final_balance);
    assert_eq!(initial_balance_owner + FEE_VALUE, final_balance_owner);

    println!("C");
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
      Ok(_) => panic!("should panic!"),
      _ => (),
    }
    println!("D");
    anyhow::Ok(())
  }
}
