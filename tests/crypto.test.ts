import { describe, it, expect } from 'vitest';
import { LatticeLWEEngine } from '../src/crypto/lattice-lwe.js';
import { HomomorphicLatticeEngine } from '../src/crypto/homomorphic.js';

describe('Post-Quantum Lattice & Homomorphic Crypto Engine Tests', () => {
  it('should encrypt and decrypt bit message correctly using LWE', () => {
    const engine = new LatticeLWEEngine(8, 257);
    const keyPair = engine.generateKeyPair();

    const message = 1;
    const ciphertext = engine.encrypt(message, keyPair);
    const decrypted = engine.decrypt(ciphertext, keyPair.secretKey);

    expect(decrypted).toBe(message);
  });

  it('should perform homomorphic addition on ciphertexts without server decryption', () => {
    const engine = new LatticeLWEEngine(8, 257);
    const keyPair = engine.generateKeyPair();

    const m1 = 1;
    const m2 = 1;
    const c1 = engine.encrypt(m1, keyPair);
    const c2 = engine.encrypt(m2, keyPair);

    const cSum = HomomorphicLatticeEngine.addHomomorphic(c1, c2, engine.modulus);
    const decryptedSum = engine.decrypt(cSum, keyPair.secretKey);

    expect(decryptedSum).toBe(m1 + m2);
  });
});
