use workspaces::result::CallExecutionDetails;

use crate::*;

const ALLOWLIST_STORAGE_COST: u128 = 400_000_000_000_000_000_000;

const ZERO_VALUE: &str =
  "21663839004416932945382355908790599225266501822907911457504978515578255421292";

const Q: &str = "21888242871839275222246405745257275088548364400416034343698204186575808495617";
const QF: &str = "21888242871839275222246405745257275088696311157297823662689037894645226208583";

pub type CategoryRisk = (Category, RiskScore);

#[derive(Serialize, Deserialize)]
pub enum Category {
  // for all unspecified categories
  All,
  // HAPI returns 'None' when address wasn't find in database
  None,
  // Wallet service - custodial or mixed wallets
  WalletService,
  // Merchant service
  MerchantService,
  // Mining pool
  MiningPool,
  // Exchange
  Exchange,
  // DeFi application
  DeFi,
  // OTC Broker
  OTCBroker,
  // Cryptocurrency ATM
  ATM,
  // Gambling
  Gambling,
  // Illicit organization
  IllicitOrganization,
  // Mixer
  Mixer,
  // Darknet market or service
  DarknetService,
  // Scam
  Scam,
  // Ransomware
  Ransomware,
  // Theft - stolen funds
  Theft,
  // Counterfeit - fake assets
  Counterfeit,
  // Terrorist financing
  TerroristFinancing,
  // Sanctions
  Sanctions,
  // Child abuse and porn materials
  ChildAbuse,
}

pub type RiskScore = u8;

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
#[serde(tag = "type")]
pub enum Currency {
  Near,
  Nep141 { account_id: AccountId },
}

pub async fn initialize_registry(
    worker: &Worker<Sandbox>,
    contract: &Contract,
    owner: &Account,
    authorizer: &Account,
    risk_params: Vec<CategoryRisk>,
  ) -> anyhow::Result<()> {
    owner
      .call(&worker, contract.id(), "new")
      .args_json(json!({
          "owner": owner.id(),
          "authorizer": authorizer.id(),
          "risk_params": risk_params,
          "height": 20,
          "last_roots_len": 20,
          "q": Q,
          "zero_value": ZERO_VALUE,
      }))?
      .gas(300000000000000)
      .transact()
      .await?;
    anyhow::Ok(())
  }

pub async fn initialize_hyc(
  worker: &Worker<Sandbox>,
  contract: &Contract,
  owner: &Account,
  registry: &Account,
  currency: Option<&Account>,
  deposit_value: u128,
  owner_fee: u128,
  vk: serde_json::Value,
) -> anyhow::Result<()> {
  let currency = match currency {
    Some(account) => json!({"type": "Nep141", "account_id": account.id()}),
    None => json!({"type": "Near"}),
  };
  owner
    .call(&worker, contract.id(), "new")
    .args_json(json!({
        "owner": owner.id(),
        "registry": registry.id(),
        // merkle tree params
        "height": 20,
        "last_roots_len": 20,
        "zero_value": ZERO_VALUE,
        // wl params
        "currency": currency,
        "deposit_value": deposit_value.to_string(),
        "percent_fee": owner_fee.to_string(),
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
        "q": Q,
        "qf": QF,
        "w1": vk["w"],
    }))?
    .gas(300000000000000)
    .transact()
    .await?;
  anyhow::Ok(())
}

pub async fn deposit_near(
  worker: &Worker<Sandbox>,
  contract: &Contract,
  sender: &Account,
  secret_hash: serde_json::Value,
  deposit_value: u128,
) -> anyhow::Result<CallExecutionDetails> {
  let result = sender
    .call(&worker, contract.id(), "deposit")
    .args_json(json!({ "secrets_hash": secret_hash }))?
    .deposit(deposit_value)
    .gas(300000000000000)
    .transact()
    .await?;
  println!("{:#?}", result.outcomes());
  let mut final_result = vec![];
  for value in result.outcomes() {
    final_result.push(value.clone());
  }
  anyhow::Ok(result)
  
}

pub async fn allowlist(
  worker: &Worker<Sandbox>,
  contract: &Contract,
  sender: &Account,
  account: &Account,
) -> anyhow::Result<()> {
  sender
    .call(&worker, contract.id(), "allowlist")
    .args_json(json!({
        "account_id": account.id()
    }))?
    .gas(300000000000000)
    .deposit(ALLOWLIST_STORAGE_COST)
    .transact()
    .await?;
  anyhow::Ok(())
}

pub async fn withdraw(
  worker: &Worker<Sandbox>,
  contract: &Contract,
  sender: &Account,
  relayer: Option<String>,
  receiver: &Account,
  public: serde_json::Value,
  proof: serde_json::Value,
) -> anyhow::Result<CallExecutionDetails> {
  let result = sender
    .call(&worker, contract.id(), "withdraw")
    .args_json(json!({
      "root": public[0],
      "nullifier_hash": public[1],
      "recipient": receiver.id(),
      "relayer": relayer,
      "fee": public[4],
      "refund": public[5],
      "allowlist_root": public[6],
      "a":{
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
    }))?
    .gas(300000000000000)
    .transact()
    .await?;
  println!("{:#?}", result.outcomes());
  let mut final_result = vec![];
  for value in result.outcomes() {
    final_result.push(value.clone());
  }
  anyhow::Ok(result)
}

pub async fn add_entry(
  worker: &Worker<Sandbox>,
  contract: &Contract,
  sender: &Account,
  currency: Currency,
  amount: u128,
  entry_account: &Account,
) -> anyhow::Result<CallExecutionDetails> {
  let result = sender
    .call(&worker, contract.id(), "add_entry")
    .args_json(json!({
      "currency": currency,
      "amount": amount.to_string(),
      "account_id": entry_account.id()  
    }))?
    .deposit(1)
    .gas(300000000000000)
    .transact()
    .await?;
  println!("{:#?}", result.outcomes());
  let mut final_result = vec![];
  for value in result.outcomes() {
    final_result.push(value.clone());
  }
  anyhow::Ok(result)
}

pub async fn remove_entry(
  worker: &Worker<Sandbox>,
  contract: &Contract,
  sender: &Account,
  currency: Currency,
  amount: u128,
) -> anyhow::Result<CallExecutionDetails> {
  let result = sender
    .call(&worker, contract.id(), "remove_entry")
    .args_json(json!({
      "currency": currency,
      "amount": amount.to_string(),
    }))?
    .deposit(1)
    .gas(300000000000000)
    .transact()
    .await?;
  println!("{:#?}", result.outcomes());
  let mut final_result = vec![];
  for value in result.outcomes() {
    final_result.push(value.clone());
  }
  anyhow::Ok(result)
}

pub async fn remove_from_allowlist(
  worker: &Worker<Sandbox>,
  contract: &Contract,
  sender: &Account,
  entry_account: &Account,
) -> anyhow::Result<CallExecutionDetails> {
  let result = sender
    .call(&worker, contract.id(), "remove_from_allowlist")
    .args_json(json!({
      "account_id": entry_account.id()  
    }))?
    .deposit(1)
    .gas(300000000000000)
    .transact()
    .await?;
  println!("{:#?}", result.outcomes());
  let mut final_result = vec![];
  for value in result.outcomes() {
    final_result.push(value.clone());
  }
  anyhow::Ok(result)
}

pub async fn view_all_currencies(
  worker: &Worker<Sandbox>,
  contract: &Contract,
) -> anyhow::Result<Vec<Currency>> {
  let response: Vec<Currency> = contract
  .view(
    worker,
    "view_all_currencies",
    json!({})
    .to_string()
    .into_bytes(),
  )
  .await?
  .json()?;

  anyhow::Ok(
    response
  )
}

pub async fn view_currency_contracts(
  worker: &Worker<Sandbox>,
  contract: &Contract,
  currency: Currency,
) -> anyhow::Result<HashMap<String, String>> {
  let response: HashMap<String, String> = contract
  .view(
    worker,
    "view_currency_contracts",
    json!({
      "currency": currency
    })
    .to_string()
    .into_bytes(),
  )
  .await?
  .json()?;

  anyhow::Ok(
    response
  )
}

pub async fn view_is_contract_allowed(
  worker: &Worker<Sandbox>,
  contract: &Contract,
  entry_account: &Account,
) -> anyhow::Result<bool> {
  let response: bool = contract
  .view(
    worker,
    "view_is_contract_allowed",
    json!({
      "account_id": entry_account.id()
    })
    .to_string()
    .into_bytes(),
  )
  .await?
  .json()?;

  anyhow::Ok(
    response
  )
}
