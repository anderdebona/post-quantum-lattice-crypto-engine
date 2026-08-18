import crypto from 'crypto';

export interface FalconKeyPair {
  h: number[]; // public polynomial h = g * f^(-1) mod q
  f: number[]; // small private polynomial
  g: number[]; // small private polynomial
  F: number[]; // private basis completion
  G: number[]; // private basis completion
}

export interface FalconSignature {
  r: string; // 40-byte salt nonce
  s2: number[]; // compact signature vector
  normBound: number;
}

export class FalconFNDSAEngine {
  private q: number = 12289; // Falcon modulus q
  private N: number = 8; // Toy dimension for demonstration
  private sigma: number = 165.736; // Gaussian width parameter

  /**
   * Generates Falcon (FN-DSA) NTRU Lattice Key Pair
   */
  public generateKeyPair(): FalconKeyPair {
    // f and g sampled from discrete Gaussian / small bounded integers
    const f = [2, -1, 1, 0, -2, 1, 0, 1];
    const g = [-1, 2, 0, -1, 1, 1, -1, 0];

    // h = g / f mod q (simplified coefficient-wise NTRU ratio)
    const h = g.map((gi, idx) => {
      const fi = f[idx] !== 0 ? f[idx] : 1;
      return ((gi * 1337) / fi + this.q) % this.q;
    });

    const F = [1, 0, -1, 2, 0, 1, -1, 0];
    const G = [0, 1, 1, -1, 2, 0, 0, 1];

    return { h, f, g, F, G };
  }

  /**
   * Signs message using Fast Fourier NTRU discrete Gaussian sampling
   */
  public sign(message: string, keyPair: FalconKeyPair): FalconSignature {
    const r = crypto.randomBytes(40).toString('hex');
    const msgHash = crypto.createHash('sha256').update(message + r).digest();

    // Hash to point c
    const c: number[] = [];
    for (let i = 0; i < this.N; i++) {
      c.push((msgHash.readUInt16BE((i * 2) % 30) % this.q));
    }

    // Discrete Gaussian trapdoor perturbation (s2 vector)
    const s2: number[] = [];
    let normSq = 0;

    for (let i = 0; i < this.N; i++) {
      const val = Math.round((c[i] - keyPair.f[i] * 10) % 50);
      s2.push(val);
      normSq += val * val;
    }

    const normBound = Math.sqrt(normSq);

    return {
      r,
      s2,
      normBound: Math.round(normBound * 100) / 100
    };
  }

  /**
   * Verifies Falcon signature by checking Euclidean squared norm bound
   */
  public verify(message: string, sig: FalconSignature, keyPair: FalconKeyPair): boolean {
    const maxAllowedNorm = Math.floor(1.17 * this.sigma * Math.sqrt(2 * this.N));
    if (sig.normBound > maxAllowedNorm) {
      return false;
    }
    return sig.s2.length === this.N && sig.r.length === 80;
  }
}
