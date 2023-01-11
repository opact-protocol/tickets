use crate::*;

pub fn egcd(a: SignedU256, b: SignedU256) -> (SignedU256, SignedU256, SignedU256) {
    assert!(a < b);
    if a == SignedU256::zero() {
        return (b, SignedU256::zero(), SignedU256::one());
    } else {
        let (g, x, y) = egcd(b % a, a);
        return (g, y - (b / a) * x, x);
    }
}

pub fn modinverse(a: U256, m: U256) -> Option<U256> {
    let a = SignedU256 {
        sign: true,
        word: a,
    };
    let m = SignedU256 {
        sign: true,
        word: m,
    };
    let (g, x, _) = egcd(a, m);
    if g != SignedU256::one() {
        return None;
    } else {
        return Some((x % m).word);
    }
}

pub fn inverse_array(m: U256, values: Vec<U256>) -> Vec<U256> {
    let len_values = values.len();
    let mut partials = Vec::with_capacity(len_values + 1);
    partials.push(U256::one());
    for i in 0..len_values {
        partials.push(mulmod(partials.last().unwrap().clone(), values.get(i).unwrap().clone(), m));
    }
    let mut inv = modinverse(partials.last().unwrap().clone(), m).unwrap();
    let mut output = vec![U256::zero(); len_values];
    for i in (0..len_values).rev() {
        output[i] = match values.get(i) {
            Some(_) => mulmod(partials.get(i).unwrap().clone(), inv, m),
            None => U256::zero()
        };
        inv = mulmod(inv, values.get(i).unwrap_or(&U256::one()).clone(), m);
    }

    output
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn basic() {
        // table of quotient, value, inverse
        let test_table = [
            (26, 3, Some(9)),
            (30, 1, Some(1)),
            (30, 7, Some(13)),
            (30, 23, Some(17)),
            (21, 16, Some(4)),
            (21, 15, None),
            (21, 20, Some(20)),
            (10, 7, Some(3)),
            (10, 8, None),
        ];
        for test in test_table.iter() {
            match test.2 {
                Some(inverse) => assert_eq!(
                    modinverse(U256::from(test.1), U256::from(test.0)),
                    Some(U256::from(inverse))
                ),

                None => {
                    assert!(modinverse(U256::from(test.1), U256::from(test.0)).is_none())
                }
            }
        }
    }

    #[test]
    fn invert_array() {
        let m = U256::from(12);
        let table = [(1, 1), (5, 5), (7, 7), (11, 11)];
        let mut input_vec = Vec::new();
        for item in table {
            input_vec.push(U256::from(item.0));
        }
        let output = inverse_array(m, input_vec);
        println!("{:#?}", output);
        for i in 0..output.len() {
            assert_eq!(output[i], U256::from(table[i].1));
        }
    }

    #[test]
    fn invert_array_2() {
        let m = U256::from(34);
        let table = [(1, 1), (3, 23), (5, 7), (11, 31), (13, 21)];
        let mut input_vec = Vec::new();
        for item in table {
            input_vec.push(U256::from(item.0));
        }
        let output = inverse_array(m, input_vec);
        println!("{:#?}", output);
        for i in 0..output.len() {
            assert_eq!(output[i], U256::from(table[i].1));
        }
    }
}