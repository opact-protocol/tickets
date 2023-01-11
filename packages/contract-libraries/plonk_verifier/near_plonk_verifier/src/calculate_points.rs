use crate::*;

impl Verifier {
    pub fn calculate_a1(&self, proof: Proof, temp: &mut TempValues) {
        let mul = proof.wxi_w.scalar_mul(temp.u.unwrap());
        temp.a_1 = Some(G1Point::addition(&mul, &proof.wxi));
    }

    pub fn calculate_b1(&self, proof: Proof, temp: &mut TempValues) {
        let mut p: G1Point;
        let mut s: U256;
        let mut s_1: U256;

        s = mulmod(proof.eval_a, temp.v_1.unwrap(), self.q);
        p = self.q_l.scalar_mul(s);

        s = mulmod(s, proof.eval_b, self.q);
        p = G1Point::addition(&self.q_m.scalar_mul(s), &p);

        s = mulmod(proof.eval_b, temp.v_1.unwrap(), self.q);
        p = G1Point::addition(&self.q_r.scalar_mul(s), &p);

        s = mulmod(proof.eval_c, temp.v_1.unwrap(), self.q);
        p = G1Point::addition(&self.q_o.scalar_mul(s), &p);

        s = temp.v_1.unwrap();
        p = G1Point::addition(&self.q_c.scalar_mul(s), &p);

        s = (proof.eval_a + temp.beta_xi.unwrap()) % self.q;
        s = (s + temp.gamma.unwrap()) % self.q;
        s_1 = mulmod(self.k_1, temp.beta_xi.unwrap(), self.q);
        s_1 = (s_1 + proof.eval_b) % self.q;
        s_1 = (s_1 + temp.gamma.unwrap()) % self.q;
        s = mulmod(s, s_1, self.q);
        s_1 = mulmod(self.k_2, temp.beta_xi.unwrap(), self.q);
        s_1 = (s_1 + proof.eval_c) % self.q;
        s_1 = (s_1 + temp.gamma.unwrap()) % self.q;
        s = mulmod(s, s_1, self.q);
        s = mulmod(s, temp.alpha.unwrap(), self.q);
        s = mulmod(s, temp.v_1.unwrap(), self.q);
        s_1 = mulmod(temp.eval_l[0], temp.alpha.unwrap(), self.q);
        s_1 = mulmod(s_1, temp.alpha.unwrap(), self.q);
        s_1 = mulmod(s_1, temp.v_1.unwrap(), self.q);
        s = (s + s_1) % self.q;
        s = (s + temp.u.unwrap()) % self.q;
        p = G1Point::addition(&proof.z.scalar_mul(s), &p);

        s = mulmod(temp.beta.unwrap(), proof.eval_s1, self.q);
        s = (s + proof.eval_a) % self.q;
        s = (s + temp.gamma.unwrap()) % self.q;
        s_1 = mulmod(temp.beta.unwrap(), proof.eval_s2, self.q);
        s_1 = (s_1 + proof.eval_b) % self.q;
        s_1 = (s_1 + temp.gamma.unwrap()) % self.q;
        s = mulmod(s, s_1, self.q);
        s = mulmod(s, temp.alpha.unwrap(), self.q);
        s = mulmod(s, temp.v_1.unwrap(), self.q);
        s = mulmod(s, temp.beta.unwrap(), self.q);
        s = mulmod(s, proof.eval_zw, self.q);
        s = (self.q - s) % self.q;
        p = G1Point::addition(&self.s_3.scalar_mul(s), &p);

        p = G1Point::addition(&proof.t_1, &p);
        s = temp.xin.unwrap();
        p = G1Point::addition(&proof.t_2.scalar_mul(s), &p);
        s = mulmod(s, s, self.q);
        p = G1Point::addition(&proof.t_3.scalar_mul(s), &p);

        p = G1Point::addition(&proof.a.scalar_mul(temp.v_2.unwrap()), &p);
        p = G1Point::addition(&proof.b.scalar_mul(temp.v_3.unwrap()), &p);
        p = G1Point::addition(&proof.c.scalar_mul(temp.v_4.unwrap()), &p);
        p = G1Point::addition(&self.s_1.scalar_mul(temp.v_5.unwrap()), &p);
        p = G1Point::addition(&self.s_2.scalar_mul(temp.v_6.unwrap()), &p);

        s = temp.eval_t.unwrap();
        s = (s + mulmod(proof.eval_r, temp.v_1.unwrap(), self.q)) % self.q;
        s = (s + mulmod(proof.eval_a, temp.v_2.unwrap(), self.q)) % self.q;
        s = (s + mulmod(proof.eval_b, temp.v_3.unwrap(), self.q)) % self.q;
        s = (s + mulmod(proof.eval_c, temp.v_4.unwrap(), self.q)) % self.q;
        s = (s + mulmod(proof.eval_s1, temp.v_5.unwrap(), self.q)) % self.q;
        s = (s + mulmod(proof.eval_s2, temp.v_6.unwrap(), self.q)) % self.q;
        s = (s + mulmod(proof.eval_zw, temp.u.unwrap(), self.q)) % self.q;
        s = (self.q - s) % self.q;
        p = G1Point::addition(&G1Point::p1().scalar_mul(s), &p);

        s = temp.xi.unwrap();
        p = G1Point::addition(&proof.wxi.scalar_mul(s), &p);

        s = mulmod(temp.u.unwrap(), temp.xi.unwrap(), self.q);
        s = mulmod(s, self.w1, self.q);
        p = G1Point::addition(&proof.wxi_w.scalar_mul(s), &p);

        temp.b_1 = Some(p);

    }
}