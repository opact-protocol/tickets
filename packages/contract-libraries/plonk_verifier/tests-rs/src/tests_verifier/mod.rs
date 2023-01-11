#[cfg(test)]
mod tests {

    use crate::*;
    use serde::{Serialize, Deserialize};
    use uint::construct_uint;

    #[derive(Debug, Serialize, Deserialize)]
    pub struct TempValues {
      alpha: Option<String>,
      beta: Option<String>,
      gamma: Option<String>,
      xi: Option<String>,
      xin: Option<String>,
      beta_xi: Option<String>,
      v_1: Option<String>,
      v_2: Option<String>,
      v_3: Option<String>,
      v_4: Option<String>,
      v_5: Option<String>,
      v_6: Option<String>,
      u: Option<String>,
      pl: Option<String>,
      eval_t: Option<String>,
      a_1: Option<serde_json::Value>,
      b_1: Option<serde_json::Value>,
      zh: Option<String>,
      zh_inv: Option<String>,
      eval_l: Vec<String>,
  }

    #[tokio::test]
    async fn test_normal_flow() -> anyhow::Result<()> {
        let worker: Worker<Sandbox> = workspaces::sandbox().await?;

        construct_uint!(
          pub struct U256(4);
        );

        fn to_u256(value: serde_json::Value) -> String {
          U256::from_dec_str(value.as_str().unwrap()).unwrap().to_string()
        }

        let root = worker.root_account()?;

        // 1. Initialize contracts
        // DEPLOY REWARD_TOKEN
        let wasm_file = get_wasm("verifier_test.wasm")?;
        let verifier = deploy_contract(&root, &worker, "verifier", &wasm_file).await;

        let vk = get_vk("verification_key.json").unwrap();

        verifier
            .call(&worker, "new")
            .args_json(json!({
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
            
            }))
            .unwrap()
            .transact()
            .await
            .unwrap();

        // Iterates over all proofs in temp_proofs to
        // perform multiple tests
        let mut count = 1;
        loop {
            let proof = match get_json(format!("proof{}.json", count).as_str()) {
                Some(value) => value,
                _ => break,
            };
            let public = match get_json(format!("public{}.json", count).as_str()) {
                Some(value) => value,
                _ => break,
            };

            // println!("{}", proof);
            // println!("{}", public);

            let correct_assertion: bool = verifier
                .call(&worker, "verify")
                .args_json(json!({
                  "proof": {
                    "public_values": public,
                    "a": {
                      "x": to_u256(proof["A"][0].clone()),
                      "y": to_u256(proof["A"][1].clone()),
                    },
                    "b": {
                      "x": to_u256(proof["B"][0].clone()),
                      "y": to_u256(proof["B"][1].clone()),
                    },
                    "c": {
                      "x": to_u256(proof["C"][0].clone()),
                      "y": to_u256(proof["C"][1].clone()),
                    },
                    "z": {
                      "x": to_u256(proof["Z"][0].clone()),
                      "y": to_u256(proof["Z"][1].clone()),
                    },
                    "t_1": {
                      "x": to_u256(proof["T1"][0].clone()),
                      "y": to_u256(proof["T1"][1].clone()),
                    },
                    "t_2": {
                      "x": to_u256(proof["T2"][0].clone()),
                      "y": to_u256(proof["T2"][1].clone()),
                    },
                    "t_3": {
                      "x": to_u256(proof["T3"][0].clone()),
                      "y": to_u256(proof["T3"][1].clone()),
                    },
                    "eval_a": to_u256(proof["eval_a"].clone()),
                    "eval_b": to_u256(proof["eval_b"].clone()),
                    "eval_c": to_u256(proof["eval_c"].clone()),
                    "eval_s1": to_u256(proof["eval_s1"].clone()),
                    "eval_s2": to_u256(proof["eval_s2"].clone()),
                    "eval_zw": to_u256(proof["eval_zw"].clone()),
                    "eval_r": to_u256(proof["eval_r"].clone()),
                    "wxi": {
                      "x": to_u256(proof["Wxi"][0].clone()),
                      "y": to_u256(proof["Wxi"][1].clone()),
                    },
                    "wxi_w": {
                      "x": to_u256(proof["Wxiw"][0].clone()),
                      "y": to_u256(proof["Wxiw"][1].clone()),
                    },
                  }
                }))
                .unwrap()
                .gas(300_000_000_000_000)
                .transact()
                .await
                .unwrap()
                .json()
                .unwrap();
            println!("{:#?}", correct_assertion);
            assert!(correct_assertion);

            let incorrect_assertion: bool = verifier
                .call(&worker, "verify")
                .args_json(json!({
                  // 1039 is a prime number, hence will never be the public
                  // input for this circuit
                    "proof": {
                      "public_values": ["1039"],
                      "a": {
                        "x": proof["A"][0],
                        "y": proof["A"][1]
                      },
                      "b": {
                        "x": proof["B"][0],
                        "y": proof["B"][1]
                      },
                      "c": {
                        "x": proof["C"][0],
                        "y": proof["C"][1]
                      },
                      "z": {
                        "x": proof["Z"][0],
                        "y": proof["Z"][1]
                      },
                      "t_1": {
                        "x": proof["T1"][0],
                        "y": proof["T1"][1]
                      },
                      "t_2": {
                        "x": proof["T2"][0],
                        "y": proof["T2"][1]
                      },
                      "t_3": {
                        "x": proof["T3"][0],
                        "y": proof["T3"][1]
                      },
                      "eval_a": proof["eval_a"],
                      "eval_b": proof["eval_b"],
                      "eval_c": proof["eval_c"],
                      "eval_s1": proof["eval_s1"],
                      "eval_s2": proof["eval_s2"],
                      "eval_zw": proof["eval_zw"],
                      "eval_r": proof["eval_r"],
                      "wxi": {
                        "x": proof["Wxi"][0],
                        "y": proof["Wxi"][1]
                      },
                      "wxi_w": {
                        "x": proof["Wxiw"][0],
                        "y": proof["Wxiw"][1]
                      },
                    }

                }))
                .unwrap()
                .gas(300_000_000_000_000)
                .transact()
                .await
                .unwrap()
                .json()
                .unwrap();
            assert!(!incorrect_assertion);

            count += 1;
        }
        if count == 1 {
            panic!("No proofs were tested");
        }

        
        anyhow::Ok(())
    }
}
