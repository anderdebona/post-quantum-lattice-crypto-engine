export interface LWEKeyPair {
  dimension: number;
  modulus: number;
  secretKey: number[];
  publicKeyA: number[][];
  publicKeyB: number[];
}

export interface LWECiphertext {
  vectorU: number[];
  valueV: number;
}

export class LatticeLWEEngine {
  public dimension: number;
  public modulus: number;

  constructor(dimension: number = 8, modulus: number = 257) {
    this.dimension = dimension;
    this.modulus = modulus;
  }

  /**
   * Key Generation for Learning With Errors (LWE)
   */
  public generateKeyPair(): LWEKeyPair {
    const secretKey = Array.from({ length: this.dimension }, () =>
      Math.floor(Math.random() * 5)
    );

    const m = 16; // Number of LWE samples
    const publicKeyA: number[][] = [];
    const publicKeyB: number[] = [];

    for (let i = 0; i < m; i++) {
      const row = Array.from({ length: this.dimension }, () =>
        Math.floor(Math.random() * this.modulus)
      );
      publicKeyA.push(row);

      // Dot product: A * s + error
      const dot = row.reduce((acc, val, idx) => acc + val * secretKey[idx], 0);
      const error = this.sampleDiscreteGaussian();
      publicKeyB.push((dot + error) % this.modulus);
    }

    return {
      dimension: this.dimension,
      modulus: this.modulus,
      secretKey,
      publicKeyA,
      publicKeyB,
    };
  }

  /**
   * Encrypts integer message m using LWE public key
   */
  public encrypt(message: number, keyPair: LWEKeyPair): LWECiphertext {
    const r = Array.from({ length: keyPair.publicKeyA.length }, () =>
      Math.floor(Math.random() * 2)
    );

    const vectorU = Array.from({ length: this.dimension }, (_, j) => {
      let sum = 0;
      for (let i = 0; i < keyPair.publicKeyA.length; i++) {
        sum += keyPair.publicKeyA[i][j] * r[i];
      }
      return sum % this.modulus;
    });

    let sumV = 0;
    for (let i = 0; i < keyPair.publicKeyB.length; i++) {
      sumV += keyPair.publicKeyB[i] * r[i];
    }

    const messageScaled = Math.round((message * this.modulus) / 4);
    const valueV = (sumV + messageScaled) % this.modulus;

    return { vectorU, valueV };
  }

  /**
   * Decrypts ciphertext (u, v) using LWE secret key
   */
  public decrypt(ciphertext: LWECiphertext, secretKey: number[]): number {
    let dot = 0;
    for (let i = 0; i < this.dimension; i++) {
      dot += ciphertext.vectorU[i] * secretKey[i];
    }

    let diff = (ciphertext.valueV - dot) % this.modulus;
    if (diff < 0) diff += this.modulus;

    // Threshold decoding to recover discrete message
    return Math.round((diff * 4) / this.modulus);
  }

  private sampleDiscreteGaussian(): number {
    // Discrete Gaussian error generator (-1, 0, 1)
    const rand = Math.random();
    if (rand < 0.25) return -1;
    if (rand < 0.75) return 0;
    return 1;
  }
}
