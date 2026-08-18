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

import { HashBasedSignatureScheme } from '../src/crypto/hash-signature.js';

describe('Hash-Based Signature', () => {
  it('should generate OTS keypair', () => {
    const kp = HashBasedSignatureScheme.generateOTSKeypair(8);
    expect(kp.privateKeys.length).toBe(8);
    expect(kp.publicKeys.length).toBe(8);
  });
  it('should sign and verify messages', () => {
    const kp = HashBasedSignatureScheme.generateOTSKeypair(8);
    const sig = HashBasedSignatureScheme.sign('Hello PQC', kp.privateKeys);
    expect(HashBasedSignatureScheme.verify('Hello PQC', sig)).toBe(true);
  });
  it('should reject tampered messages', () => {
    const kp = HashBasedSignatureScheme.generateOTSKeypair(8);
    const sig = HashBasedSignatureScheme.sign('Original', kp.privateKeys);
    expect(HashBasedSignatureScheme.verify('Tampered', sig)).toBe(false);
  });
});

describe('RingLWEEncryptionScheme (v4.0.0)', () => {
  it('should encrypt and decrypt bit in polynomial quotient ring Z_q[X]/(X^n+1)', async () => {
    const { RingLWEEncryptionScheme } = await import('../src/crypto/ring-lwe.js');
    const scheme = new RingLWEEncryptionScheme(8, 257);
    const kp = scheme.generateKeyPair();

    const ct1 = scheme.encryptBit(1, kp);
    const pt1 = scheme.decryptBit(ct1, kp.secretKey);
    expect(pt1).toBe(1);

    const ct0 = scheme.encryptBit(0, kp);
    const pt0 = scheme.decryptBit(ct0, kp.secretKey);
    expect(pt0).toBe(0);
  });
});

describe('KyberKemKeyExchange (v4.0.0)', () => {
  it('should encapsulate and decapsulate shared secret agreement', async () => {
    const { KyberKemKeyExchange } = await import('../src/crypto/kyber-kem.js');
    const kem = new KyberKemKeyExchange(8, 257);
    const kp = kem.generateKeypair();

    const encap = kem.encapsulate(kp);
    expect(encap.sharedSecretHash.startsWith('0x')).toBe(true);

    const decapSecret = kem.decapsulate(encap.ciphertextBits);
    expect(decapSecret).toBe(encap.sharedSecretHash);
  });
});

describe('DilithiumMLDSAEngine (v5.0.0)', () => {
  it('should generate ML-DSA keys, sign payload, and verify signature under rejection bounds', async () => {
    const { DilithiumMLDSAEngine } = await import('../src/crypto/dilithium-mldsa.js');
    const engine = new DilithiumMLDSAEngine();

    const kp = engine.generateKeyPair();
    expect(kp.publicKey.t1.length).toBe(8);

    const message = 'Post-Quantum Financial Settlement Tx #99482';
    const signature = engine.sign(message, kp);
    expect(signature.z.length).toBe(8);

    const isValid = engine.verify(message, signature, kp.publicKey);
    expect(isValid).toBe(true);
  });
});

describe('FalconFNDSAEngine (v5.0.0)', () => {
  it('should generate Falcon keys, sign with discrete Gaussian sampler, and verify norm bound', async () => {
    const { FalconFNDSAEngine } = await import('../src/crypto/falcon-fndsa.js');
    const falcon = new FalconFNDSAEngine();

    const kp = falcon.generateKeyPair();
    expect(kp.h.length).toBe(8);

    const msg = 'Confidential Top-Secret Post-Quantum Payload';
    const sig = falcon.sign(msg, kp);
    expect(sig.s2.length).toBe(8);
    expect(sig.r.length).toBe(80);

    const verified = falcon.verify(msg, sig, kp);
    expect(verified).toBe(true);
  });
});


