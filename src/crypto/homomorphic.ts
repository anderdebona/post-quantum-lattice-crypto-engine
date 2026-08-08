import { LWECiphertext } from './lattice-lwe.js';

export class HomomorphicLatticeEngine {
  /**
   * Performs Homomorphic Addition directly on two encrypted ciphertexts:
   * Enc(m1) + Enc(m2) = Enc(m1 + m2)
   * The server never decrypts or accesses the underlying plaintext messages!
   */
  public static addHomomorphic(
    c1: LWECiphertext,
    c2: LWECiphertext,
    modulus: number = 257
  ): LWECiphertext {
    const vectorU = c1.vectorU.map((val, idx) => (val + c2.vectorU[idx]) % modulus);
    const valueV = (c1.valueV + c2.valueV) % modulus;

    return { vectorU, valueV };
  }
}
