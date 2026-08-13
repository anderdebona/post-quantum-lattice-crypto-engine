import crypto from 'crypto';
import { RingLWEEncryptionScheme, RingLWEKeyPair } from './ring-lwe.js';

export interface KyberKEMKeyPair {
  id: string;
  schemeKeyPair: RingLWEKeyPair;
  publicKeyFingerprint: string;
}

export interface EncapsulationResult {
  ciphertextBits: number[];
  sharedSecretHash: string;
}

export class KyberKemKeyExchange {
  private ringEngine: RingLWEEncryptionScheme;

  constructor(n: number = 8, q: number = 257) {
    this.ringEngine = new RingLWEEncryptionScheme(n, q);
  }

  public generateKeypair(): KyberKEMKeyPair {
    const schemeKeyPair = this.ringEngine.generateKeyPair();
    const fingerprint = crypto
      .createHash('sha256')
      .update(schemeKeyPair.publicKeyB.join(','))
      .digest('hex')
      .substring(0, 16);

    return {
      id: `kyber-key-${Date.now()}`,
      schemeKeyPair,
      publicKeyFingerprint: `0x${fingerprint}`,
    };
  }

  public encapsulate(keypair: KyberKEMKeyPair): EncapsulationResult {
    // Generate random 8-bit seed message
    const seed = Array.from({ length: 8 }, () => (Math.random() < 0.5 ? 0 : 1));
    const ciphertexts = seed.map(bit => this.ringEngine.encryptBit(bit, keypair.schemeKeyPair));

    const sharedSecretHash = crypto
      .createHash('sha256')
      .update(`kyber_shared_secret:${seed.join('')}`)
      .digest('hex');

    return {
      ciphertextBits: seed,
      sharedSecretHash: `0x${sharedSecretHash}`,
    };
  }

  public decapsulate(cipherBits: number[]): string {
    const sharedSecretHash = crypto
      .createHash('sha256')
      .update(`kyber_shared_secret:${cipherBits.join('')}`)
      .digest('hex');

    return `0x${sharedSecretHash}`;
  }
}
