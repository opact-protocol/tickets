#[cfg(test)]
mod tests {

  use crate::*;

  /// Integration tests
  /// aims to test the correct display of information by
  /// the registry contract for the end user
  /// 0. initialize registry contract
  /// 1. add currencies and values - check that contract returns correctly
  /// 2. update values - check that contract returns correctly
  /// 3. check that all contracts are still in allowlist
  /// 4. remove contracts from allowlist and check 
  #[tokio::test]
  async fn test_registry_records() -> anyhow::Result<()> {
    let worker: Worker<Sandbox> = workspaces::sandbox().await?;

    let root = worker.root_account().unwrap();

    // 0. Initialize accounts
    // CREATE USER ACCOUNTS
    let owner = create_user_account(&root, &worker, "owner").await;
    let near_10 = create_user_account(&root, &worker, "near_10").await;
    let near_100 = create_user_account(&root, &worker, "near_100").await;
    let near_1000 = create_user_account(&root, &worker, "near_1000").await;
    let near_10000 = create_user_account(&root, &worker, "near_10000").await;
    let near_100000 = create_user_account(&root, &worker, "near_100000").await;
    let nep_token = create_user_account(&root, &worker, "nep_token").await;
    let nep_10 = create_user_account(&root, &worker, "nep_10").await;
    let nep_100 = create_user_account(&root, &worker, "nep_100").await;
    let nep_1000 = create_user_account(&root, &worker, "nep_1000").await;
    let nep_10000 = create_user_account(&root, &worker, "nep_10000").await;
    let nep_100000 = create_user_account(&root, &worker, "nep_100000").await;
    
    let replace_nep_10 = create_user_account(&root, &worker, "replace_nep_10").await;

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

    // 0. Initialize contract
    // DEPLOY REGISTRY CONTRACT
    let registry_wasm = get_wasm("registry.wasm")?;
    let registry = deploy_contract(&root, &worker, "registry_contract", &registry_wasm).await;

    
    // INITIALIZE REGISTRY
    initialize_registry(&worker, &registry, &owner, hapi_one.as_account(), vec![]).await?;

    // 1. add currencies and values - check that contract returns correctly
    let near_vec = vec![
        (10, &near_10),
        (100, &near_100),
        (1000, &near_1000),
        (10000, &near_10000),
        (100000, &near_100000),
    ];

    for entry in near_vec.iter() {
        add_entry(&worker, &registry, &owner, Currency::Near, entry.0, entry.1).await?;
    }

    let supported_currencies = view_all_currencies(&worker, &registry).await?;
    let supported_near_amounts = view_currency_contracts(&worker, &registry, Currency::Near).await?;

    assert_eq!(
        supported_currencies,
        vec![Currency::Near]
    );

    assert_eq!(
        near_vec.iter().map(| el | (el.0.to_string(), el.1.id().to_string())).collect::<HashMap<String, String>>(), 
        supported_near_amounts
    );

    let nep_currency = Currency::Nep141 { account_id: nep_token.id().clone() };

    let nep_vec = vec![
        (10, &nep_10),
        (100, &nep_100),
        (1000, &nep_1000),
        (10000, &nep_10000),
        (100000, &nep_100000),
    ];

    for entry in nep_vec.iter() {
        add_entry(&worker, &registry, &owner, nep_currency.clone(), entry.0, entry.1).await?;
    }

    let supported_currencies = view_all_currencies(&worker, &registry).await?;
    let supported_nep_amounts = view_currency_contracts(&worker, &registry, nep_currency.clone()).await?;

    assert_eq!(
        supported_currencies,
        vec![Currency::Near, nep_currency.clone()]
    );

    assert_eq!(
        nep_vec.iter().map(| el | (el.0.to_string(), el.1.id().to_string())).collect::<HashMap<String, String>>(), 
        supported_nep_amounts
    );

    // 2. update values - check that contract returns correctly
    let nep_vec = vec![
        (10, &replace_nep_10),
        (100, &nep_100),
        (1000, &nep_1000),
        (10000, &nep_10000),
        (100000, &nep_100000),
    ];
    add_entry(&worker, &registry, &owner, nep_currency.clone(), 10, &replace_nep_10).await?;

    let supported_nep_amounts = view_currency_contracts(&worker, &registry, nep_currency.clone()).await?;

    assert_eq!(
        nep_vec.iter().map(| el | (el.0.to_string(), el.1.id().to_string())).collect::<HashMap<String, String>>(), 
        supported_nep_amounts
    );

    let nep_vec = vec![
        (100, &nep_100),
        (1000, &nep_1000),
        (10000, &nep_10000),
        (100000, &nep_100000),
    ];
    remove_entry(&worker, &registry, &owner, nep_currency.clone(), 10).await?;

    let supported_nep_amounts = view_currency_contracts(&worker, &registry, nep_currency.clone()).await?;

    assert_eq!(
        nep_vec.iter().map(| el | (el.0.to_string(), el.1.id().to_string())).collect::<HashMap<String, String>>(), 
        supported_nep_amounts
    );

    // 3. check that all contracts are still in allowlist
    assert!(view_is_contract_allowed(&worker, &registry, &nep_10).await?);
    assert!(view_is_contract_allowed(&worker, &registry, &replace_nep_10).await?);

    // 4. remove contracts from allowlist and check 
    remove_from_allowlist(&worker, &registry, &owner, &nep_10).await?;
    assert!(!view_is_contract_allowed(&worker, &registry, &nep_10).await?);

    anyhow::Ok(())
  }
}
