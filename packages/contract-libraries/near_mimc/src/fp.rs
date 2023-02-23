use ff_wasm_unknown_unknown::PrimeField;
use crate::U256;

#[derive(PrimeField)]
#[PrimeFieldModulus = "21888242871839275222246405745257275088548364400416034343698204186575808495617"]
#[PrimeFieldGenerator = "7"]
#[PrimeFieldReprEndianness = "little"]
pub struct Fp([u64; 4]);

impl Fp {
    pub const fn dangerous_new(limbs: [u64; 4]) -> Self {
        Self(limbs)
    }

    pub const fn dangerous_limbs(&self) -> [u64; 4] {
        self.0
    }
}

impl From<U256> for Fp {
    fn from(val: U256) -> Self {
        Fp::from_repr(FpRepr(val.to_le_bytes())).unwrap()
    }
}

impl From<Fp> for U256 {
    fn from(val: Fp) -> Self {
        U256::from_little_endian(&val.to_repr().0)
    }
}