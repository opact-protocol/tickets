#[cfg(test)]
mod tests {

    use crate::*;
    use uint::construct_uint;

    #[tokio::test]
    async fn test_normal_flow() -> anyhow::Result<()> {
        let worker: Worker<Sandbox> = workspaces::sandbox().await?;

        construct_uint! {
          pub struct U256(4);
        }

        impl U256 {
            pub fn to_le_bytes(&self) -> [u8; 32] {
                let mut arr = [0u8; 32];
                self.to_little_endian(&mut arr);
                arr
            }
        }

        let root = worker.root_account()?;

        // 1. Initialize contracts
        // DEPLOY REWARD_TOKEN
        let wasm_file = get_wasm("verifier_test.wasm")?;
        let verifier = deploy_contract(&root, &worker, "verifier", &wasm_file).await;

        verifier
          .call(&worker, "new")
          .args_json(json!({
            "alfa1": {
              "x": "12852938543402334301646476449868015513343264303942979538057108922633242901310",
              "y": "1331150464556312708381161063883663729752996672343425173041566660683025640663"
            },
            "beta2": {
              "x": [
              "14660913413154806842806980087803250210514024948813723077577418947725640088297", 
              "193264549980750865420096378424789089323788416225497105421890637537959842833"
              ],
              "y": [
                "13208383630670660671676463469987574973454777342075903895905813395180730110630", 
                "14202579661367946205956752270357718863201670897456807414361928848043872869988"
              ]
            },
            "gamma2": {
              "x": [
                "10857046999023057135944570762232829481370756359578518086990519993285655852781", 
                "11559732032986387107991004021392285783925812861821192530917403151452391805634"
              ],
              "y": [
                "8495653923123431417604973247489272438418190587263600148770280649306958101930", 
                "4082367875863433681332203403145435568316851327593401208105741076214120093531"
              ]
            },
            "delta2": {
              "x": [
                "5545774397932017216992695090171157990426788121864452986229659311206628435423", 
                "11005541246156848213930109943213813736364632035239149310614322301495825391689"
              ],
              "y": [
                "15170165142922301118088030345588824683560985142153293408356722405718345488174", 
                "17202876653284222524069569567346580539220187442265370599108403272333892138741"
              ]
            },
            "ic": [
              {
                "x": "7678817736507666334892031135223399609605934184659810399529511247095502575183",
                "y": "4244603288940309179127956986105046509979010377884023735815539155225029617511"
              },
              {
                "x": "15340937229374298252864958249352011869511383210199250608976172525853538794897",
                "y": "13644787217246875581586372651915989974686778760603293039795592963577670295292"
              },
            ],
          }))
          .unwrap()
          .transact()
          .await
          .unwrap();
        
        // Iterates over all proofs in temp_proofs to
        // perform multiple tests
        let mut count = 0;
        loop {
          let proof = match get_json(format!("{}proof.json", count).as_str()) {
            Some(value) => value,
            _ => break
          };
          let public = match get_json(format!("{}public.json", count).as_str()) {
            Some(value) => value,
            _ => break
          };

          let correct_assertion: bool = verifier
          .call(&worker, "verify")
          .args_json(
            json!({
              "input": public,
              "proof": {
                "a": {
                  "x": proof["pi_a"][0],
                  "y": proof["pi_a"][1]
                },
                "b": {
                  "x": proof["pi_b"][0],
                  "y": proof["pi_b"][1]
                },
                "c": {
                  "x": proof["pi_c"][0],
                  "y": proof["pi_c"][1]
                }
              }
            })
          )
          .unwrap()
          .gas(300_000_000_000_000)
        .transact()
        .await
        .unwrap()
        .json().unwrap();
        assert!(correct_assertion);

        let incorrect_assertion: bool = verifier
          .call(&worker, "verify")
          .args_json(
            json!({
              // 1039 is a prime number, hence will never be the public
              // input for this circuit
              "input": ["1039"],
              "proof": {
                "a": {
                  "x": proof["pi_a"][0],
                  "y": proof["pi_a"][1]
                },
                "b": {
                  "x": proof["pi_b"][0],
                  "y": proof["pi_b"][1]
                },
                "c": {
                  "x": proof["pi_c"][0],
                  "y": proof["pi_c"][1]
                }
              }
            })
          )
          .unwrap()
          .gas(300_000_000_000_000)
        .transact()
        .await
        .unwrap()
        .json().unwrap();
        assert!(!incorrect_assertion);

          count += 1;
        }
        if count == 0 {
          panic!("No proofs were tested");
        }

        anyhow::Ok(())
    }
}
