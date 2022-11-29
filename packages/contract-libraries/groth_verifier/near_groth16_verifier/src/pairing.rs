use core::slice;
use std::mem;

use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::sys::{self, alt_bn128_g1_multiexp, alt_bn128_g1_sum, alt_bn128_pairing_check};

use crate::U256;

const ATOMIC_OP_REGISTER: u64 = std::u64::MAX - 2;

pub unsafe fn read_register_g1(register_id: u64) -> G1Point {
    let mut value = [std::mem::MaybeUninit::<u8>::uninit(); 64];
    sys::read_register(register_id, value.as_mut_ptr() as _);
    let bytes_value: [u8; 64] = std::mem::transmute(value);
    G1Point {
        x: U256::from_little_endian(&bytes_value[0..32]),
        y: U256::from_little_endian(&bytes_value[32..]),
    }
}

#[derive(Serialize, Deserialize, BorshSerialize, BorshDeserialize, Clone, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct G1Point {
    pub x: U256,
    pub y: U256,
}

impl G1Point {
    pub fn p1() -> Self {
        Self {
            x: U256::from(1),
            y: U256::from(2),
        }
    }

    pub fn to_packed_sum(&self, sign: u8) -> (u8, ([u8; 32], [u8; 32])) {
        assert!(sign <= 1, "invalid sign");
        (sign, (self.x.to_le_bytes(), self.y.to_le_bytes()))
    }

    pub fn negate(&self) -> G1Point {
        let q = U256::from_dec_str(
            "21888242871839275222246405745257275088696311157297823662689037894645226208583",
        )
        .unwrap();
        if self.x.is_zero() && self.y.is_zero() {
            G1Point {
                x: U256::zero(),
                y: U256::zero(),
            }
        } else {
            G1Point {
                x: self.x.clone(),
                y: q - (self.y.clone() % q),
            }
        }
    }

    pub fn addition(p1: &G1Point, p2: &G1Point) -> G1Point {
        /// alt_bn128_g1_multiexp input type is [(u8, (u256, u256))]
        /// packed as little endian.
        /// Use 32 [u8; 32] as u256
        type InputType = [(u8, ([u8; 32], [u8; 32])); 2];

        let input: InputType = [p1.to_packed_sum(0), p2.to_packed_sum(0)];
        let p: *const InputType = &input;
        let p: *const u8 = p as *const u8;
        let input_bytes: &[u8] = unsafe { slice::from_raw_parts(p, mem::size_of::<InputType>()) };

        unsafe {
            alt_bn128_g1_sum(
                mem::size_of::<InputType>() as _,
                input_bytes.as_ptr() as _,
                ATOMIC_OP_REGISTER,
            );
            read_register_g1(ATOMIC_OP_REGISTER)
        }
    }

    pub fn scalar_mul(&self, s: U256) -> G1Point {
        /// alt_bn128_g1_multiexp input type is [((u256, u256), u256)]
        /// packed as little endian.
        /// Use 32 [u8; 32] as u256
        type InputType = (([u8; 32], [u8; 32]), [u8; 32]);

        let input: InputType = (
            (self.x.to_le_bytes(), self.y.to_le_bytes()),
            s.to_le_bytes(),
        );
        let p: *const InputType = &input;
        let p: *const u8 = p as *const u8;
        let input_bytes: &[u8] =
            unsafe { slice::from_raw_parts(p, mem::size_of::<((U256, U256), U256)>()) };

        unsafe {
            alt_bn128_g1_multiexp(
                input_bytes.len() as _,
                input_bytes.as_ptr() as _,
                ATOMIC_OP_REGISTER,
            );
            read_register_g1(ATOMIC_OP_REGISTER)
        }
    }
}

#[derive(Serialize, Deserialize, BorshSerialize, BorshDeserialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct G2Point {
    pub x: [U256; 2],
    pub y: [U256; 2],
}

impl G2Point {
    pub fn p2() -> Self {
        Self {
            x: [
                U256::from_dec_str(
                    "11559732032986387107991004021392285783925812861821192530917403151452391805634",
                )
                .unwrap(),
                U256::from_dec_str(
                    "10857046999023057135944570762232829481370756359578518086990519993285655852781",
                )
                .unwrap(),
            ],
            y: [
                U256::from_dec_str(
                    "4082367875863433681332203403145435568316851327593401208105741076214120093531",
                )
                .unwrap(),
                U256::from_dec_str(
                    "8495653923123431417604973247489272438418190587263600148770280649306958101930",
                )
                .unwrap(),
            ],
        }
    }
}

pub fn pairing(p1: Vec<&G1Point>, p2: Vec<&G2Point>) -> bool {
    assert!(p1.len() == p2.len(), "pairing-lengths-failed");

    let mut bytes = Vec::with_capacity(p1.len() * 6 * 32);
    let mut buf = [0u8; 64 + 128];
    for i in 0..p1.len() {
        buf[0..32].copy_from_slice(&p1[i].x.to_le_bytes());
        buf[32..64].copy_from_slice(&p1[i].y.to_le_bytes());
        buf[64..96].copy_from_slice(&p2[i].x[0].to_le_bytes());
        buf[96..128].copy_from_slice(&p2[i].x[1].to_le_bytes());
        buf[128..160].copy_from_slice(&p2[i].y[0].to_le_bytes());
        buf[160..192].copy_from_slice(&p2[i].y[1].to_le_bytes());
        bytes.extend_from_slice(&buf);
    }

    let value_ptr = bytes.as_ptr() as u64;
    let value_len = bytes.len() as u64;
    
    unsafe { alt_bn128_pairing_check(value_len, value_ptr) != 0 }
}

#[allow(dead_code)]
pub fn pairing_prod_2(a1: &G1Point, a2: &G2Point, b1: &G1Point, b2: &G2Point) -> bool {
    let p1: Vec<&G1Point> = vec![a1, b1];
    let p2: Vec<&G2Point> = vec![a2, b2];

    pairing(p1, p2)
}

#[allow(dead_code)]
pub fn pairing_prod_3(
    a1: &G1Point,
    a2: &G2Point,
    b1: &G1Point,
    b2: &G2Point,
    c1: &G1Point,
    c2: &G2Point,
) -> bool {
    let p1: Vec<&G1Point> = vec![a1, b1, c1];
    let p2: Vec<&G2Point> = vec![a2, b2, c2];

    pairing(p1, p2)
}

#[allow(dead_code)]
pub fn pairing_prod_4(
    a1: &G1Point,
    a2: &G2Point,
    b1: &G1Point,
    b2: &G2Point,
    c1: &G1Point,
    c2: &G2Point,
    d1: &G1Point,
    d2: &G2Point,
) -> bool {
    let p1: Vec<&G1Point> = vec![a1, b1, c1, d1];
    let p2: Vec<&G2Point> = vec![a2, b2, c2, d2];

    pairing(p1, p2)
}
