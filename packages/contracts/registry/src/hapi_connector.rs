use crate::*;

pub type CategoryRisk = (Category, RiskScore);

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, PartialEq, Eq, Debug, Clone)]
#[serde(crate = "near_sdk::serde")]
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

pub const MAX_RISK_LEVEL: RiskScore = 10;

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct AML {
  pub account_id: AccountId,
  pub aml_conditions: UnorderedMap<Category, RiskScore>,
}

impl AML {
  pub fn get_aml(&self) -> (&AccountId, Vec<(Category, RiskScore)>) {
    (
      &self.account_id,
      self
        .aml_conditions
        .iter()
        .map(|(id, acc)| (id, acc))
        .collect(),
    )
  }

  pub fn update_category(&mut self, category: Category, accepted_risk_score: RiskScore) {
    assert!(
      accepted_risk_score <= MAX_RISK_LEVEL,
      "ERR_RISK_SCORE_IS_INVALID"
    );
    assert!(accepted_risk_score > 0, "ERR_RISK_SCORE_IS_INVALID");
    self.aml_conditions.insert(&category, &accepted_risk_score);
  }

  pub fn bulk_update_category(&mut self, risk_params: Vec<CategoryRisk>) {
    for (category, risk) in risk_params {
        self.update_category(category, risk);
    }
  }

  pub fn remove_category(&mut self, category: Category) {
    assert!(category != Category::All);
    self.aml_conditions.remove(&category);
  }

  pub fn get_category(&self, category: &Category) -> RiskScore {
    self.aml_conditions.get(category).unwrap_or(MAX_RISK_LEVEL)
  }

  pub fn new(account_id: AccountId, prefix: StorageKey) -> AML {
    let mut aml = Self {
      account_id,
      aml_conditions: UnorderedMap::new(prefix),
    };
    aml.update_category(Category::All, MAX_RISK_LEVEL);
    aml
  }

  /// Checks the category according to the set level of risk. If the risk level is not set for this category, it is considered MAX_RISK_LEVEL.
  pub fn assert_risk(&self, category_risk: CategoryRisk) -> bool {
    let (category, risk) = category_risk;

    let accepted_risk = match self.aml_conditions.get(&category) {
      Some(risk) => risk,
      None => MAX_RISK_LEVEL,
    };

    risk <= accepted_risk
  }
}
