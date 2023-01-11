use crate::*;

impl Verifier {
    pub fn calculate_t(&self, proof: Proof, temp: &mut TempValues) {
        let mut t: U256;
        let mut t_1: U256;
        let mut t_2: U256;

        t = (proof.eval_r + temp.pl.unwrap()) % self.q;
        t_1 = mulmod(proof.eval_s1, temp.beta.unwrap(), self.q);
        t_1 = (t_1 + proof.eval_a) % self.q;
        t_1 = (t_1 + temp.gamma.unwrap()) % self.q;

        t_2 = mulmod(proof.eval_s2, temp.beta.unwrap(), self.q);
        t_2 = (t_2 + proof.eval_b) % self.q;
        t_2 = (t_2 + temp.gamma.unwrap()) % self.q;

        t_1 = mulmod(t_1, t_2, self.q);

        t_2 = (proof.eval_c + temp.gamma.unwrap()) % self.q;

        t_1 = mulmod(t_1, t_2, self.q);
        t_1 = mulmod(t_1, proof.eval_zw, self.q);
        t_1 = mulmod(t_1, temp.alpha.unwrap(), self.q);

        t_2 = mulmod(temp.eval_l[0], temp.alpha.unwrap(), self.q);
        t_2 = mulmod(t_2, temp.alpha.unwrap(), self.q);

        t_1 = (t_1 + t_2) % self.q;

        t = t + self.q - t_1;
        t = mulmod(t, temp.zh_inv.unwrap(), self.q);

        temp.eval_t = Some(t);
    }
}