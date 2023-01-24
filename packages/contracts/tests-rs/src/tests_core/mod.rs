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

    const ZERO_VALUE: &str =
      "21663839004416932945382355908790599225266501822907911457504978515578255421292";
    const DEPOSIT_VALUE: u128 = 10_000_000_000_000_000_000_000_000;

    let vk = get_json("verification_key.json").unwrap();

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
          "zero_value": ZERO_VALUE,
          // wl params
          "height_wl": 20,
          "last_roots_len_wl": 20,
          "deposit_value": DEPOSIT_VALUE.to_string(),
          // verifier
          "power": vk["power"].to_string(),
          "n_public": vk["nPublic"].to_string(),
          "q_m": {
            "x": vk["Qm"][0],
            "y": vk["Qm"][1]
          },
          "q_l": {
            "x": vk["Ql"][0],
            "y": vk["Ql"][1]
          },
          "q_r":{
            "x": vk["Qr"][0],
            "y": vk["Qr"][1]
          },
          "q_o":{
            "x": vk["Qo"][0],
            "y": vk["Qo"][1]
          },
          "q_c":{
            "x": vk["Qc"][0],
            "y": vk["Qc"][1]
          },
          "s_1": {
            "x": vk["S1"][0],
            "y": vk["S1"][1]
          },
          "s_2": {
            "x": vk["S2"][0],
            "y": vk["S2"][1]
          },
          "s_3":  {
            "x": vk["S3"][0],
            "y": vk["S3"][1]
          },
          "k_1": vk["k1"],
          "k_2": vk["k2"],
          "x_2": {
            "x": [
              vk["X_2"][0][0],
              vk["X_2"][0][1],
              ],
            "y": [
              vk["X_2"][1][0],
              vk["X_2"][1][1],
              ],
          },
          "q": "21888242871839275222246405745257275088548364400416034343698204186575808495617",
          "qf": "21888242871839275222246405745257275088696311157297823662689037894645226208583",
          "w1": vk["w"],
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
        "a":{
          "x": proof1["A"][0],
          "y": proof1["A"][1]
        },
        "b": {
          "x": proof1["B"][0],
          "y": proof1["B"][1]
        },
        "c": {
          "x": proof1["C"][0],
          "y": proof1["C"][1]
        },
        "z": {
          "x": proof1["Z"][0],
          "y": proof1["Z"][1]
        },
        "t_1": {
          "x": proof1["T1"][0],
          "y": proof1["T1"][1]
        },
        "t_2": {
          "x": proof1["T2"][0],
          "y": proof1["T2"][1]
        },
        "t_3": {
          "x": proof1["T3"][0],
          "y": proof1["T3"][1]
        },
        "eval_a": proof1["eval_a"],
        "eval_b": proof1["eval_b"],
        "eval_c": proof1["eval_c"],
        "eval_s1": proof1["eval_s1"],
        "eval_s2": proof1["eval_s2"],
        "eval_zw": proof1["eval_zw"],
        "eval_r": proof1["eval_r"],
        "wxi": {
          "x": proof1["Wxi"][0],
          "y": proof1["Wxi"][1]
        },
        "wxi_w": {
          "x": proof1["Wxiw"][0],
          "y": proof1["Wxiw"][1]
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
        "a":{
          "x": proof1["A"][0],
          "y": proof1["A"][1]
        },
        "b": {
          "x": proof1["B"][0],
          "y": proof1["B"][1]
        },
        "c": {
          "x": proof1["C"][0],
          "y": proof1["C"][1]
        },
        "z": {
          "x": proof1["Z"][0],
          "y": proof1["Z"][1]
        },
        "t_1": {
          "x": proof1["T1"][0],
          "y": proof1["T1"][1]
        },
        "t_2": {
          "x": proof1["T2"][0],
          "y": proof1["T2"][1]
        },
        "t_3": {
          "x": proof1["T3"][0],
          "y": proof1["T3"][1]
        },
        "eval_a": proof1["eval_a"],
        "eval_b": proof1["eval_b"],
        "eval_c": proof1["eval_c"],
        "eval_s1": proof1["eval_s1"],
        "eval_s2": proof1["eval_s2"],
        "eval_zw": proof1["eval_zw"],
        "eval_r": proof1["eval_r"],
        "wxi": {
          "x": proof1["Wxi"][0],
          "y": proof1["Wxi"][1]
        },
        "wxi_w": {
          "x": proof1["Wxiw"][0],
          "y": proof1["Wxiw"][1]
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
        "a":{
          "x": proof2["A"][0],
          "y": proof2["A"][1]
        },
        "b": {
          "x": proof2["B"][0],
          "y": proof2["B"][1]
        },
        "c": {
          "x": proof2["C"][0],
          "y": proof2["C"][1]
        },
        "z": {
          "x": proof2["Z"][0],
          "y": proof2["Z"][1]
        },
        "t_1": {
          "x": proof2["T1"][0],
          "y": proof2["T1"][1]
        },
        "t_2": {
          "x": proof2["T2"][0],
          "y": proof2["T2"][1]
        },
        "t_3": {
          "x": proof2["T3"][0],
          "y": proof2["T3"][1]
        },
        "eval_a": proof2["eval_a"],
        "eval_b": proof2["eval_b"],
        "eval_c": proof2["eval_c"],
        "eval_s1": proof2["eval_s1"],
        "eval_s2": proof2["eval_s2"],
        "eval_zw": proof2["eval_zw"],
        "eval_r": proof2["eval_r"],
        "wxi": {
          "x": proof2["Wxi"][0],
          "y": proof2["Wxi"][1]
        },
        "wxi_w": {
          "x": proof2["Wxiw"][0],
          "y": proof2["Wxiw"][1]
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
