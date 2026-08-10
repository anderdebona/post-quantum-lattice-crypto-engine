import { describe, it, expect } from 'vitest';
import { LatticeLWEEngine } from '../src/crypto/lattice-lwe.js';
import { HomomorphicLatticeEngine } from '../src/crypto/homomorphic.js';
import { LatticeKEM } from '../src/crypto/key-encapsulation.js';
import { LatticeDigitalSignature } from '../src/crypto/digital-signature.js';

describe('LWE Encryption', () => {
  it('should encrypt and decrypt correctly', () => {
    const engine = new LatticeLWEEngine(8, 257);
    const keyPair = engine.generateKeyPair();
    const ct = engine.encrypt(1, keyPair);
    const pt = engine.decrypt(ct, keyPair.secretKey);
    expect(pt).toBe(1);
  });

  it('should encrypt and produce valid ciphertext structure', () => {
    const engine = new LatticeLWEEngine(8, 257);
    const keyPair = engine.generateKeyPair();
    const ct = engine.encrypt(1, keyPair);
    expect(ct.vectorU.length).toBe(8);
    expect(typeof ct.valueV).toBe('number');
  });
});

describe('Homomorphic Addition', () => {
  it('should compute Enc(a) + Enc(b) = Enc(a+b)', () => {
    const engine = new LatticeLWEEngine(8, 257);
    const kp = engine.generateKeyPair();
    const c1 = engine.encrypt(1, kp);
    const c2 = engine.encrypt(1, kp);
    const cSum = HomomorphicLatticeEngine.addHomomorphic(c1, c2, engine.modulus);
    const result = engine.decrypt(cSum, kp.secretKey);
    expect(result).toBe(2);
  });
});

describe('Key Encapsulation Mechanism (KEM)', () => {
  it('should generate keypair and encapsulate shared secret', () => {
    const kem = new LatticeKEM(8, 257);
    const kp = kem.generateKeypair();
    const result = kem.encapsulate(kp);
    expect(result.sharedSecret.length).toBe(8);
    expect(result.keyLength).toBe(8);
    result.sharedSecret.forEach((bit) => expect([0, 1]).toContain(bit));
  });
});

describe('Digital Signature', () => {
  it('should sign and verify a message', () => {
    const signer = new LatticeDigitalSignature(8, 257);
    const kp = signer.generateSigningKeypair();
    const sig = signer.sign('Hello Post-Quantum World', kp.signingKey);
    const valid = signer.verify('Hello Post-Quantum World', sig, kp.verificationKey);
    expect(valid).toBe(true);
  });

  it('should reject tampered messages', () => {
    const signer = new LatticeDigitalSignature(8, 257);
    const kp = signer.generateSigningKeypair();
    const sig = signer.sign('Original Message', kp.signingKey);
    const valid = signer.verify('Tampered Message', sig, kp.verificationKey);
    expect(valid).toBe(false);
  });

  it('should generate valid signature vectors within modulus', () => {
    const signer = new LatticeDigitalSignature(8, 257);
    const kp = signer.generateSigningKeypair();
    const sig = signer.sign('Test', kp.signingKey);
    expect(sig.signatureVector.length).toBe(8);
    sig.signatureVector.forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(257);
    });
  });
});
