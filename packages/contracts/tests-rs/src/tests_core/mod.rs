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
  async fn test_normal_flow() -> anyhow::Result<()> {
    let worker: Worker<Sandbox> = workspaces::sandbox().await?;

    let root = worker.root_account().unwrap();

    // 0. Initialize accounts
    // CREATE USER ACCOUNTS
    let owner = create_user_account(&root, &worker, "owner").await;
    let user = create_user_account(&root, &worker, "user").await;
    let user2 = create_user_account(&root, &worker, "user2").await;
    let user3 = create_user_account(&root, &worker, "user3").await;
    let user4 = create_user_account(&root, &worker, "user4").await;

    // 1. Initialize contract
    // DEPLOY CONTRACT
    let contract_wasm = get_wasm("contract.wasm")?;
    let contract = deploy_contract(&root, &worker, "core_contract", &contract_wasm).await;
    
    const FIELD_SIZE: &str = "21888242871839275222246405745257275088548364400416034343698204186575808495617";
    const ZERO_VALUE: &str = "21663839004416932945382355908790599225266501822907911457504978515578255421292";
    const DEPOSIT_VALUE: u128 = 10_000_000_000_000_000_000_000_000; 


    let verifying_keys = get_json("verification_key.json").unwrap();

    // INITIALIZE CONTRACT
    owner
        .call(&worker, contract.id(), "new")
        .args_json(json!({
            "owner": owner.id(),
            // merkle tree params
            "height": 20,
            "last_roots_len": 20,
            "field_size": FIELD_SIZE,
            "zero_value": ZERO_VALUE,
            // wl params
            "height_wl": 20,
            "last_roots_len_wl": 20,
            "value_of_deposit": DEPOSIT_VALUE.to_string(),
            // verifier
            "verifier": {
                "alfa1": {
                    "x": verifying_keys["vk_alpha_1"][0],
                    "y": verifying_keys["vk_alpha_1"][1]
                },
                "beta2": {
                    "x": [verifying_keys["vk_beta_2"][0][0], verifying_keys["vk_beta_2"][0][1]],
                    "y": [verifying_keys["vk_beta_2"][1][0], verifying_keys["vk_beta_2"][1][1]]
                },
                "gamma2": {
                    "x": [verifying_keys["vk_gamma_2"][0][0], verifying_keys["vk_gamma_2"][0][1]],
                    "y": [verifying_keys["vk_gamma_2"][1][0], verifying_keys["vk_gamma_2"][1][1]]
                },
                "delta2": {
                    "x": [verifying_keys["vk_delta_2"][0][0], verifying_keys["vk_delta_2"][0][1]],
                    "y": [verifying_keys["vk_delta_2"][1][0], verifying_keys["vk_delta_2"][1][1]]
                },
                "ic": verifying_keys["IC"].as_array().unwrap().iter().map(|g1| json!({
                    "x": g1[0],
                    "y": g1[1]
                })).collect::<Vec<serde_json::Value>>(),
                "snark_scalar_field": FIELD_SIZE,
            },
        }))?
        .gas(300000000000000)
        .transact()
        .await?;

    // 1. commit deposits


    let commitment1 = get_json("commitment1.json").unwrap();

    user
        .call(&worker, contract.id(), "deposit")
        .args_json(json!({
            "secrets_hash": commitment1["secrets_hash"]
        }))?
        .deposit(DEPOSIT_VALUE)
        .gas(300000000000000)
        .transact()
        .await?;

    // 2. attempt to withdraw with wrong proofs - assert fail
    
    // 3. withdraw with correct proofs

    anyhow::Ok(())
  }
}
