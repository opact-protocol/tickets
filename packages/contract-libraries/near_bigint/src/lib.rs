use std::io::{Error, ErrorKind};

use near_sdk::{
    __private::BorshIntoStorageKey,
    borsh::{BorshDeserialize, BorshSerialize},
    serde::{self, de::Visitor, Deserialize, Serialize},
};

use paste::paste;

// copied from borsh crate internals
const ERROR_UNEXPECTED_LENGTH_OF_INPUT: &str = "Unexpected length of input";

#[macro_export]
macro_rules! construct_near_bigint {
    ( $(#[$attr:meta])* $visibility:vis struct $name:ident ($n_words:tt); ) => {


        uint::construct_uint! { @construct $(#[$attr])* $visibility struct $name ($n_words); }

        paste! {
            const [<$name _BYTE_SIZE>]: usize = 8 * $n_words;

            impl $name {


                pub fn to_be_bytes(&self) -> [u8; [<$name _BYTE_SIZE>]] {
                    let mut arr = [0u8; [<$name _BYTE_SIZE>]];
                    self.to_big_endian(&mut arr);
                    arr
                }

                pub fn to_le_bytes(&self) -> [u8; [<$name _BYTE_SIZE>]] {
                    let mut arr = [0u8; [<$name _BYTE_SIZE>]];
                    self.to_little_endian(&mut arr);
                    arr
                }

                #[inline]
                const fn empty_buffer() -> [u8; [<$name _BYTE_SIZE>]] {
                    [0; [<$name _BYTE_SIZE>]]
                }
            }

            impl $name {
				/// Low 2 words (u128)
				#[inline]
				pub const fn low_u128(&self) -> u128 {
					let &$name(ref arr) = self;
					((arr[1] as u128) << 64) + arr[0] as u128
				}

				/// Conversion to u128 with overflow checking
				///
				/// # Panics
				///
				/// Panics if the number is larger than 2^128.
				#[inline]
				pub fn as_u128(&self) -> u128 {
					let &$name(ref arr) = self;
					for i in 2..$n_words {
						if arr[i] != 0 {
							panic!("Integer overflow when casting to u128")
						}

					}
					self.low_u128()
				}
			}

            impl BorshSerialize for $name {


                #[inline]
                fn serialize<W: std::io::Write>(&self, writer: &mut W) -> std::io::Result<()> {
                    let buffer: &mut [u8; [<$name _BYTE_SIZE>]] = &mut $name::empty_buffer();
                    self.to_little_endian(buffer);

                    writer.write_all(buffer)
                }

                fn try_to_vec(&self) -> std::io::Result<Vec<u8>> {
                    let mut result = Vec::with_capacity([<$name _BYTE_SIZE>]);
                    BorshSerialize::serialize(&self, &mut result)?;
                    Ok(result)
                }
            }

            impl BorshDeserialize for $name {
                #[inline]
                fn deserialize(buf: &mut &[u8]) -> std::io::Result<Self> {
                    if buf.len() < [<$name _BYTE_SIZE>] {
                        return Err(Error::new(
                            ErrorKind::InvalidInput,
                            ERROR_UNEXPECTED_LENGTH_OF_INPUT,
                        ));
                    }

                    let res = $name::from_little_endian(buf[..[<$name _BYTE_SIZE>]].try_into().unwrap());

                    *buf = &buf[[<$name _BYTE_SIZE>]..];

                    Ok(res)
                }
            }

            impl BorshIntoStorageKey for $name {}

            impl Serialize for $name {
                fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
                where
                    S: serde::Serializer,
                {
                    serializer.serialize_str(&self.to_string())
                }
            }


            struct [<$name Visitor>];

            impl<'de> Visitor<'de> for [<$name Visitor>] {
                type Value = $name;

                fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
                    formatter.write_str("an unsigned integer smaller than 2^256 - 1, encoded as a string")
                }

                fn visit_string<E>(self, v: String) -> Result<Self::Value, E>
                where
                    E: serde::de::Error,
                {
                    $name::from_dec_str(&v).or_else(|e| Err(E::custom(e)))
                }

                fn visit_str<E>(self, v: &str) -> Result<Self::Value, E>
                where
                    E: serde::de::Error,
                {
                    $name::from_dec_str(v).or_else(|e| Err(E::custom(e)))
                }
            }

            impl<'de> Deserialize<'de> for $name {
                fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
                where
                    D: serde::Deserializer<'de>,
                {
                    deserializer.deserialize_str([<$name Visitor>])
                }
            }
        }

    };
}

construct_near_bigint!(pub struct U256(4););
construct_near_bigint!(pub struct U384(6););
construct_near_bigint!(pub struct U512(8););
construct_near_bigint!(pub struct U640(10););
construct_near_bigint!(pub struct U768(12););
construct_near_bigint!(pub struct U896(14););
construct_near_bigint!(pub struct U1024(16););

#[cfg(test)]
mod tests {

    pub use rstest::{fixture, rstest};

    pub use super::*;

    #[rstest]
    fn test_construction_u256() {
        construct_near_bigint!(pub struct U256(4););

        let a = U256::from_dec_str("100").unwrap();
        let b = U256::from_dec_str("500").unwrap();

        assert_eq!(b + a, U256::from_dec_str("600").unwrap());
        assert_eq!(a.to_string(), "100".to_string());
    }
}
