use crate::*;

impl Verifier {
    pub fn calculate_challanges(&self, proof: Proof, temp: &mut TempValues) {
        let mut bytes_b = vec![];
        for value in proof.public_values {
            bytes_b.extend_from_slice(&value.to_be_bytes());
        }
        bytes_b.extend_from_slice(&proof.a.x.to_be_bytes());
        bytes_b.extend_from_slice(&proof.a.y.to_be_bytes());
        bytes_b.extend_from_slice(&proof.b.x.to_be_bytes());
        bytes_b.extend_from_slice(&proof.b.y.to_be_bytes());
        bytes_b.extend_from_slice(&proof.c.x.to_be_bytes());
        bytes_b.extend_from_slice(&proof.c.y.to_be_bytes());
        
        let beta = U256::from_big_endian(&env::keccak256(&bytes_b)) % self.q;
        temp.beta = Some(beta);
        let gamma = U256::from_big_endian(&env::keccak256(&beta.to_be_bytes())) % self.q;
        temp.gamma = Some(gamma);

        let mut bytes_z = vec![];
        bytes_z.extend_from_slice(&proof.z.x.to_be_bytes());
        bytes_z.extend_from_slice(&proof.z.y.to_be_bytes());
        let alpha = U256::from_big_endian(&env::keccak256(&bytes_z)) % self.q;
        temp.alpha = Some(alpha);

        let mut bytes_a = vec![];
        bytes_a.extend_from_slice(&proof.t_1.x.to_be_bytes());
        bytes_a.extend_from_slice(&proof.t_1.y.to_be_bytes());
        bytes_a.extend_from_slice(&proof.t_2.x.to_be_bytes());
        bytes_a.extend_from_slice(&proof.t_2.y.to_be_bytes());
        bytes_a.extend_from_slice(&proof.t_3.x.to_be_bytes());
        bytes_a.extend_from_slice(&proof.t_3.y.to_be_bytes());
        let mut a = U256::from_big_endian(&env::keccak256(&bytes_a)) % self.q;

        temp.xi = Some(a);
        temp.beta_xi = Some(mulmod(beta, a, self.q));

        let mut counter = 0;
        while counter < self.power.as_u128() {
            a = mulmod(a, a, self.q);
            counter += 1;
        }
        temp.xin = Some(a);

        a = (a - 1 + self.q) % self.q;
        temp.zh = Some(a);
        temp.zh_inv = Some(a); //value will be inversed later

        let mut bytes_eval = vec![];
        bytes_eval.extend_from_slice(&proof.eval_a.to_be_bytes());
        bytes_eval.extend_from_slice(&proof.eval_b.to_be_bytes());
        bytes_eval.extend_from_slice(&proof.eval_c.to_be_bytes());
        bytes_eval.extend_from_slice(&proof.eval_s1.to_be_bytes());
        bytes_eval.extend_from_slice(&proof.eval_s2.to_be_bytes());
        bytes_eval.extend_from_slice(&proof.eval_zw.to_be_bytes());
        bytes_eval.extend_from_slice(&proof.eval_r.to_be_bytes());
        let v_1 = U256::from_big_endian(&env::keccak256(&bytes_eval)) % self.q;
        temp.v_1 = Some(v_1);

        a = mulmod(v_1, v_1, self.q);
        temp.v_2 = Some(a);

        a = mulmod(a, v_1, self.q);
        temp.v_3 = Some(a);

        a = mulmod(a, v_1, self.q);
        temp.v_4 = Some(a);

        a = mulmod(a, v_1, self.q);
        temp.v_5 = Some(a);

        a = mulmod(a, v_1, self.q);
        temp.v_6 = Some(a);

        let mut bytes_wxi = vec![];
        bytes_wxi.extend_from_slice(&proof.wxi.x.to_be_bytes());
        bytes_wxi.extend_from_slice(&proof.wxi.y.to_be_bytes());
        bytes_wxi.extend_from_slice(&proof.wxi_w.x.to_be_bytes());
        bytes_wxi.extend_from_slice(&proof.wxi_w.y.to_be_bytes());
        let u = U256::from_big_endian(&env::keccak256(&bytes_wxi)) % self.q;
        temp.u = Some(u);
    }
}
