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
    // DEPLOY CONTRACT
    let contract_wasm = get_wasm("contract.wasm")?;
    let contract = deploy_contract(&root, &worker, "core_contract", &contract_wasm).await;

    const FIELD_SIZE: &str =
      "21888242871839275222246405745257275088548364400416034343698204186575808495617";
    const ZERO_VALUE: &str =
      "21663839004416932945382355908790599225266501822907911457504978515578255421292";
    const DEPOSIT_VALUE: u128 = 10_000_000_000_000_000_000_000_000;

    let verifying_keys = get_json("verification_key.json").unwrap();

    let commitment1 = get_json("commitment1.json").unwrap();
    let commitment2 = get_json("commitment2.json").unwrap();
    let commitment3 = get_json("commitment3.json").unwrap();
    let commitment4 = get_json("commitment4.json").unwrap();

    // INITIALIZE CONTRACT
    owner
      .call(&worker, contract.id(), "new")
      .args_json(json!({
          "owner": owner.id(),
          "authorizer": hapi_one_account,
          "max_risk": 5,
          // merkle tree params
          "height": 20,
          "last_roots_len": 20,
          "field_size": FIELD_SIZE,
          "zero_value": ZERO_VALUE,
          // wl params
          "height_wl": 20,
          "last_roots_len_wl": 20,
          "deposit_value": DEPOSIT_VALUE.to_string(),
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

    // 0. add to allowlist
    owner
      .call(&worker, contract.id(), "allowlist")
      .args_json(json!({
          "account_id": user.id()
      }))?
      .gas(300000000000000)
      .transact()
      .await?;

    owner
      .call(&worker, contract.id(), "allowlist")
      .args_json(json!({
          "account_id": user2.id()
      }))?
      .gas(300000000000000)
      .transact()
      .await?;

    owner
      .call(&worker, contract.id(), "allowlist")
      .args_json(json!({
          "account_id": user3.id()
      }))?
      .gas(300000000000000)
      .transact()
      .await?;

    owner
      .call(&worker, contract.id(), "allowlist")
      .args_json(json!({
          "account_id": user4.id()
      }))?
      .gas(300000000000000)
      .transact()
      .await?;

    // 1. commit deposits

    // assert wrong deposit fails
    let should_fail = user
      .call(&worker, contract.id(), "deposit")
      .args_json(json!({
          "secrets_hash": commitment1["secret_hash"]
      }))?
      .deposit(DEPOSIT_VALUE - 1)
      .gas(300000000000000)
      .transact()
      .await;

    match should_fail {
      Ok(_) => panic!("should fail"),
      Err(_) => (),
    }

    // make correct deposits
    user
      .call(&worker, contract.id(), "deposit")
      .args_json(json!({
          "secrets_hash": commitment1["secret_hash"]
      }))?
      .deposit(DEPOSIT_VALUE)
      .gas(300000000000000)
      .transact()
      .await?;

    user2
      .call(&worker, contract.id(), "deposit")
      .args_json(json!({
          "secrets_hash": commitment2["secret_hash"]
      }))?
      .deposit(DEPOSIT_VALUE)
      .gas(300000000000000)
      .transact()
      .await?;

    user3
      .call(&worker, contract.id(), "deposit")
      .args_json(json!({
          "secrets_hash": commitment3["secret_hash"]
      }))?
      .deposit(DEPOSIT_VALUE)
      .gas(300000000000000)
      .transact()
      .await?;

    user4
      .call(&worker, contract.id(), "deposit")
      .args_json(json!({
          "secrets_hash": commitment4["secret_hash"]
      }))?
      .deposit(DEPOSIT_VALUE)
      .gas(300000000000000)
      .transact()
      .await?;

    // assert correct proofs

    // user 1 deposits -> user 1 withdraws to user4
    let receiver_account = user4.id();

    let proof1 = get_json("proof1.json").unwrap();
    let public1 = get_json("public1.json").unwrap();

    let initial_balance = user4.view_account(&worker).await?.balance;

    user
      .call(&worker, contract.id(), "withdraw")
      .args_json(json!({
        "root": public1[0],
        "nullifier_hash": public1[1],
        "recipient": receiver_account,
        "relayer": null,
        "fee": public1[4],
        "refund": public1[5],
        "allowlist_root": public1[6],
        "proof": {
          "a": {
            "x": proof1["pi_a"][0],
            "y": proof1["pi_a"][1]
          },
          "b": {
            "x": proof1["pi_b"][0],
            "y": proof1["pi_b"][1]
          },
          "c": {
            "x": proof1["pi_c"][0],
            "y": proof1["pi_c"][1]
          }
        },
      }))?
      .gas(300000000000000)
      .transact()
      .await?;

    let final_balance = user4.view_account(&worker).await?.balance;

    assert_eq!(initial_balance + DEPOSIT_VALUE, final_balance);

    // assert proof cannot be used again
    let should_panic = user
      .call(&worker, contract.id(), "withdraw")
      .args_json(json!({
        "root": public1[0],
        "nullifier_hash": public1[1],
        "recipient": receiver_account,
        "relayer": null,
        "fee": public1[4],
        "refund": public1[5],
        "allowlist_root": public1[6],
        "proof": {
          "a": {
            "x": proof1["pi_a"][0],
            "y": proof1["pi_a"][1]
          },
          "b": {
            "x": proof1["pi_b"][0],
            "y": proof1["pi_b"][1]
          },
          "c": {
            "x": proof1["pi_c"][0],
            "y": proof1["pi_c"][1]
          }
        },
      }))?
      .gas(300000000000000)
      .transact()
      .await;

    match should_panic {
      Ok(_) => panic!("should panic"),
      Err(_) => (),
    }

    // user 2 deposits -> user1 withdraws as relayer to user4 withdraws
    let receiver_account = user4.id();

    let proof2 = get_json("proof2.json").unwrap();
    let public2 = get_json("public2.json").unwrap();

    let initial_balance1 = user.view_account(&worker).await?.balance;
    let initial_balance4 = user4.view_account(&worker).await?.balance;

    user2
      .call(&worker, contract.id(), "withdraw")
      .args_json(json!({
        "root": public2[0],
        "nullifier_hash": public2[1],
        "recipient": receiver_account,
        "relayer": user.id(),
        "fee": public2[4],
        "refund": public2[5],
        "allowlist_root": public2[6],
        "proof": {
          "a": {
            "x": proof2["pi_a"][0],
            "y": proof2["pi_a"][1]
          },
          "b": {
            "x": proof2["pi_b"][0],
            "y": proof2["pi_b"][1]
          },
          "c": {
            "x": proof2["pi_c"][0],
            "y": proof2["pi_c"][1]
          }
        },
      }))?
      .gas(300000000000000)
      .transact()
      .await?;

    let final_balance1 = user.view_account(&worker).await?.balance;
    let final_balance4 = user4.view_account(&worker).await?.balance;

    println!("initial1: {}", initial_balance1);
    println!("final1: {}", final_balance1);
    println!("initial2: {}", initial_balance4);
    println!("final2: {}", final_balance4);

    assert_eq!(
      initial_balance1 + public2[4].as_str().unwrap().parse::<u128>().unwrap(),
      final_balance1
    );
    assert_eq!(
      initial_balance4 + DEPOSIT_VALUE - public2[4].as_str().unwrap().parse::<u128>().unwrap(),
      final_balance4
    );

    // 2. attempt to withdraw with wrong proofs - assert fail

    // 3. withdraw with correct proofs

    anyhow::Ok(())
  }
}
