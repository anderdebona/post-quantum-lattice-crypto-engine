import { LatticeLWEEngine, LWEKeyPair, LWECiphertext } from './lattice-lwe.js';

/**
 * KEM encapsulation result
 */
export interface KEMEncapsulationResult {
  sharedSecret: number[];
  ciphertexts: LWECiphertext[];
  keyLength: number;
}

/**
 * Key Encapsulation Mechanism (KEM) — Post-quantum key exchange based on LWE.
 *
 * Reference: NIST CRYSTALS-Kyber specification (FIPS 203)
 */
export class LatticeKEM {
  private engine: LatticeLWEEngine;

  constructor(dimension: number = 8, modulus: number = 257) {
    this.engine = new LatticeLWEEngine(dimension, modulus);
  }

  public generateKeypair(): LWEKeyPair {
    return this.engine.generateKeyPair();
  }

  /**
   * Encapsulates a random shared secret under the public key.
   */
  public encapsulate(keyPair: LWEKeyPair): KEMEncapsulationResult {
    const keyLength = 8;
    const sharedSecret: number[] = [];
    const ciphertexts: LWECiphertext[] = [];

    for (let i = 0; i < keyLength; i++) {
      const bit = Math.random() < 0.5 ? 0 : 1;
      sharedSecret.push(bit);
      const ct = this.engine.encrypt(bit, keyPair);
      ciphertexts.push(ct);
    }

    return { sharedSecret, ciphertexts, keyLength };
  }

  /**
   * Decapsulates the shared secret using the secret key.
   */
  public decapsulate(ciphertexts: LWECiphertext[], secretKey: number[]): number[] {
    return ciphertexts.map((ct) => this.engine.decrypt(ct, secretKey));
  }

  get modulus(): number {
    return this.engine.modulus;
  }
}
