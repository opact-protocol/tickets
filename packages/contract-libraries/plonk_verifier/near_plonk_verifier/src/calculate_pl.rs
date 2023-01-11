use crate::*;

impl Verifier {
    pub fn calculate_pl(&self, proof: Proof, temp: &mut TempValues) {
        let mut pl = U256::zero();

        let mut counter = 0;
        while counter < self.n_public.as_usize() {
            let op_1 = mulmod(temp.eval_l[counter], proof.public_values[counter], self.q);
            let op_2 = pl + self.q - op_1;
            pl = op_2 % self.q;
            counter += 1;
        }

        temp.pl = Some(pl);
    }
}
