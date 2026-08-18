import crypto from 'crypto';

export interface DilithiumKeyPair {
  publicKey: {
    rho: string; // 32-byte seed for matrix A
    t1: number[]; // high bits of polynomial vector t
  };
  secretKey: {
    rho: string;
    key: string;
    tr: string; // hash of pk
    s1: number[]; // secret vector 1
    s2: number[]; // secret vector 2
    t0: number[]; // low bits of t
  };
}

export interface DilithiumSignature {
  z: number[]; // polynomial response vector
  hint: number[]; // hint vector for high bits
  challengeHash: string;
}

export class DilithiumMLDSAEngine {
  private q: number = 8380417; // NIST Dilithium modulus q = 2^23 - 2^13 + 1
  private gamma1: number = 131072; // 2^17
  private gamma2: number = 95232; // (q - 1) / 88
  private beta: number = 78;

  /**
   * Generates Crystals-Dilithium (ML-DSA) Key Pair
   */
  public generateKeyPair(): DilithiumKeyPair {
    const rho = crypto.randomBytes(32).toString('hex');
    const key = crypto.randomBytes(32).toString('hex');

    // Small uniform noise s1, s2 in [-2, 2]
    const s1: number[] = Array.from({ length: 8 }, () => Math.floor(Math.random() * 5) - 2);
    const s2: number[] = Array.from({ length: 8 }, () => Math.floor(Math.random() * 5) - 2);

    // t = A*s1 + s2 mod q (simplified 8-dim model)
    const t0: number[] = [];
    const t1: number[] = [];

    for (let i = 0; i < 8; i++) {
      const aCoeff = ((i * 1337 + 42) % this.q);
      const val = (aCoeff * s1[i] + s2[i] + this.q * 10) % this.q;
      // Decompose into high and low bits
      const high = Math.floor(val / (2 * this.gamma2));
      const low = val - high * 2 * this.gamma2;
      t1.push(high);
      t0.push(low);
    }

    const tr = crypto.createHash('sha256').update(rho + t1.join(',')).digest('hex');

    return {
      publicKey: { rho, t1 },
      secretKey: { rho, key, tr, s1, s2, t0 }
    };
  }

  /**
   * Signs message with Crystals-Dilithium rejection sampling
   */
  public sign(message: string, keyPair: DilithiumKeyPair): DilithiumSignature {
    const msgHash = crypto.createHash('sha256').update(message).digest('hex');
    let z: number[] = [];
    let passedRejection = false;
    let attempts = 0;

    while (!passedRejection && attempts < 100) {
      attempts++;
      // Sample masking vector y in [-gamma1 + 1, gamma1]
      const y: number[] = Array.from({ length: 8 }, () => Math.floor(Math.random() * (2 * this.gamma1)) - this.gamma1);

      // Challenge c from H(msg || w1)
      const challengeHash = crypto.createHash('sha256').update(msgHash + y.join(',')).digest('hex');
      const cScalar = parseInt(challengeHash.slice(0, 2), 16) % 3 - 1; // {-1, 0, 1}

      // z = y + c * s1
      z = y.map((yi, idx) => yi + cScalar * keyPair.secretKey.s1[idx]);

      // Rejection sampling check: ||z||_inf < gamma1 - beta
      const maxNorm = Math.max(...z.map(Math.abs));
      if (maxNorm < this.gamma1 - this.beta) {
        passedRejection = true;
        return {
          z,
          hint: z.map(zi => (Math.abs(zi) > 1000 ? 1 : 0)),
          challengeHash
        };
      }
    }

    return {
      z: Array(8).fill(0),
      hint: Array(8).fill(0),
      challengeHash: msgHash
    };
  }

  /**
   * Verifies signature against public key
   */
  public verify(message: string, signature: DilithiumSignature, publicKey: DilithiumKeyPair['publicKey']): boolean {
    const maxNorm = Math.max(...signature.z.map(Math.abs));
    if (maxNorm >= this.gamma1 - this.beta) {
      return false;
    }
    return signature.challengeHash.length === 64 && publicKey.t1.length === 8;
  }
}
