use near_bigint::U256;
use std::cmp;
use std::ops;

#[derive(PartialEq, Eq, Clone, Copy, Debug)]
pub struct SignedU256 {
    pub sign: bool,
    pub word: U256,
}

impl ops::Add for SignedU256 {
    type Output = Self;

    fn add(self, other: Self) -> Self {
        if self.sign == other.sign {
            Self {
                sign: self.sign,
                word: self.word + other.word,
            }
        } else {
            if self.word == other.word {
                Self {
                    sign: true,
                    word: U256::zero(),
                }
            } else if self.word > other.word {
                Self {
                    sign: self.sign,
                    word: self.word - other.word,
                }
            } else {
                Self {
                    sign: other.sign,
                    word: other.word - self.word,
                }
            }
        }
    }
}

impl ops::Sub for SignedU256 {
    type Output = Self;

    fn sub(self, other: Self) -> Self {
        self + Self {
            sign: !other.sign,
            word: other.word,
        }
    }
}

impl ops::Mul for SignedU256 {
    type Output = Self;

    fn mul(self, other: Self) -> Self {
        Self {
            sign: if (self.sign && other.sign) || (!self.sign && !other.sign) {
                true
            } else {
                false
            },
            word: self.word * other.word,
        }
    }
}

impl ops::Div for SignedU256 {
    type Output = Self;

    fn div(self, other: Self) -> Self {
        Self {
            sign: if (self.sign && other.sign) || (!self.sign && !other.sign) {
                true
            } else {
                false
            },
            word: self.word / other.word,
        }
    }
}

impl ops::Rem for SignedU256 {
    type Output = Self;

    // doesn't handle case where rhs is negative
    // since not needed for operations
    fn rem(self, rhs: Self) -> Self {
        if self.sign {
            SignedU256 {
                sign: true,
                word: self.word % rhs.word,
            }
        } else {
            let mut value = self;
            while !value.sign {
                value = value + rhs;
            }
            value
        }
    }
}

impl cmp::PartialOrd for SignedU256 {
    fn partial_cmp(&self, _other: &Self) -> Option<cmp::Ordering> {
        None
    }

    fn lt(&self, other: &Self) -> bool {
        if self.sign != other.sign {
            other.sign
        } else {
            if self.sign {
                self.word < other.word
            } else {
                self.word > other.word
            }
        }
    }

    fn le(&self, other: &Self) -> bool {
        if self.sign != other.sign {
            other.sign
        } else {
            if self.sign {
                self.word <= other.word
            } else {
                self.word >= other.word
            }
        }
    }

    fn gt(&self, other: &Self) -> bool {
        other < self
    }

    fn ge(&self, other: &Self) -> bool {
        other <= self
    }
}

impl SignedU256 {
    pub fn zero() -> Self {
        Self {
            sign: true,
            word: U256::zero(),
        }
    }

    pub fn one() -> Self {
        Self {
            sign: true,
            word: U256::one(),
        }
    }
}