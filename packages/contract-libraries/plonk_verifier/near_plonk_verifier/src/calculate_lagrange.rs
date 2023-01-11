use crate::*;

impl Verifier {
    pub fn calculate_lagrange(&self, temp: &mut TempValues) {
        let mut w = U256::one();
        let mut counter = 1;
        while counter <= self.n_public.as_u128() {
            let op_1 = temp.xi.unwrap() + self.q - w;
            let op_2 = op_1 % self.q;
            temp.eval_l.push(mulmod(self.n, op_2, self.q));

            if counter < self.n_public.as_u128() {
                w = mulmod(w, self.w1, self.q);
            }

            counter += 1;
        }

        let mut inverse_vec = vec![temp.zh_inv.unwrap()];

        for value in temp.eval_l.clone() {
            inverse_vec.push(value);
        }
        let inverse_values = inverse_array(self.q, inverse_vec);
        temp.zh_inv = Some(inverse_values[0]);
        let mut counter = 1; // counter start at 1 since zh_inv was already reset
        while counter < inverse_values.len() {
            temp.eval_l[counter - 1] = inverse_values[counter];
            counter += 1;
        }

        w = U256::one();
        let mut counter = 1;
        while counter <= self.n_public.as_u128() {
            if counter == 1 {
                temp.eval_l[0] = mulmod(temp.eval_l[0], temp.zh.unwrap(), self.q);
            } else {
                let index = (counter - 1) as usize;

                temp.eval_l[index] = mulmod(
                    w,
                    mulmod(temp.eval_l[index], temp.zh.unwrap(), self.q),
                    self.q,
                );
            }

            if counter < self.n_public.as_u128() {
                w = mulmod(w, self.w1, self.q);
            }

            counter += 1;
        }
    }
}
