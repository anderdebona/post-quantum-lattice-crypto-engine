export interface RingLWEKeyPair {
  secretKey: number[]; // s(X) in Z_q[X]/(X^n + 1)
  publicKeyA: number[]; // a(X) uniform
  publicKeyB: number[]; // b(X) = a(X)*s(X) + e(X) mod (X^n + 1, q)
}

export interface RingLWECiphertext {
  u: number[]; // u(X) = a(X)*r(X) + e1(X)
  v: number[]; // v(X) = b(X)*r(X) + e2(X) + m * round(q/2)
  n: number;
  q: number;
}

export class RingLWEEncryptionScheme {
  public readonly n: number;
  public readonly q: number;

  constructor(n: number = 8, q: number = 257) {
    this.n = n;
    this.q = q;
  }

  /**
   * Negacyclic polynomial multiplication in Z_q[X]/(X^n + 1)
   */
  public polyMul(p1: number[], p2: number[]): number[] {
    const result = new Array(this.n).fill(0);

    for (let i = 0; i < this.n; i++) {
      for (let j = 0; j < this.n; j++) {
        const targetDeg = i + j;
        const term = (p1[i] * p2[j]) % this.q;

        if (targetDeg < this.n) {
          result[targetDeg] = (result[targetDeg] + term) % this.q;
        } else {
          // X^n = -1 in Z_q[X]/(X^n + 1)
          const deg = targetDeg - this.n;
          result[deg] = (result[deg] - term + this.q) % this.q;
        }
      }
    }

    return result.map(x => ((x % this.q) + this.q) % this.q);
  }

  private smallNoise(): number[] {
    // Discrete Gaussian error proxy [-1, 0, 1]
    return Array.from({ length: this.n }, () => (Math.random() < 0.33 ? -1 : Math.random() < 0.66 ? 0 : 1));
  }

  public generateKeyPair(): RingLWEKeyPair {
    const s = this.smallNoise();
    const a = Array.from({ length: this.n }, () => Math.floor(Math.random() * this.q));
    const e = this.smallNoise();

    const as = this.polyMul(a, s);
    const b = as.map((val, idx) => ((val + e[idx]) % this.q + this.q) % this.q);

    return { secretKey: s, publicKeyA: a, publicKeyB: b };
  }

  public encryptBit(bit: number, keyPair: RingLWEKeyPair): RingLWECiphertext {
    const r = this.smallNoise();
    const e1 = this.smallNoise();
    const e2 = this.smallNoise();

    const ar = this.polyMul(keyPair.publicKeyA, r);
    const br = this.polyMul(keyPair.publicKeyB, r);

    const u = ar.map((val, idx) => ((val + e1[idx]) % this.q + this.q) % this.q);
    const halfQ = Math.floor(this.q / 2);

    const v = br.map((val, idx) => {
      const msgEncoding = idx === 0 ? bit * halfQ : 0;
      return ((val + e2[idx] + msgEncoding) % this.q + this.q) % this.q;
    });

    return { u, v, n: this.n, q: this.q };
  }

  public decryptBit(ct: RingLWECiphertext, secretKey: number[]): number {
    const us = this.polyMul(ct.u, secretKey);
    const diff = ((ct.v[0] - us[0]) % this.q + this.q) % this.q;

    const halfQ = this.q / 2;
    const distToZero = Math.min(diff, this.q - diff);
    const distToHalfQ = Math.abs(diff - halfQ);

    return distToHalfQ < distToZero ? 1 : 0;
  }
}
