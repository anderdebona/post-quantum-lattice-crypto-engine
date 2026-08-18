import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { LatticeLWEEngine } from './crypto/lattice-lwe.js';
import { HomomorphicLatticeEngine } from './crypto/homomorphic.js';
import { QuantumSecurityAnalyzer } from './crypto/shor-comparison.js';
import { RingLWEEncryptionScheme } from './crypto/ring-lwe.js';
import { KyberKemKeyExchange } from './crypto/kyber-kem.js';
import { DilithiumMLDSAEngine } from './crypto/dilithium-mldsa.js';
import { FalconFNDSAEngine } from './crypto/falcon-fndsa.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3005;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const engine = new LatticeLWEEngine(8, 257);
const keyPair = engine.generateKeyPair();

const ringEngine = new RingLWEEncryptionScheme(8, 257);
const kyberKem = new KyberKemKeyExchange(8, 257);
const dilithium = new DilithiumMLDSAEngine();
const falcon = new FalconFNDSAEngine();

app.post('/api/encrypt', (req, res) => {
  const { message = 1 } = req.body;
  const ciphertext = engine.encrypt(message, keyPair);
  const decrypted = engine.decrypt(ciphertext, keyPair.secretKey);

  res.json({
    plaintextMessage: message,
    ciphertext,
    decryptedMessage: decrypted,
    decryptionCorrect: decrypted === message,
  });
});

app.post('/api/homomorphic-add', (req, res) => {
  const { m1 = 1, m2 = 2 } = req.body;
  const c1 = engine.encrypt(m1, keyPair);
  const c2 = engine.encrypt(m2, keyPair);

  const homomorphicSum = HomomorphicLatticeEngine.addHomomorphic(c1, c2, engine.modulus);
  const decryptedSum = engine.decrypt(homomorphicSum, keyPair.secretKey);

  res.json({
    m1,
    m2,
    expectedSum: m1 + m2,
    c1,
    c2,
    homomorphicSumCiphertext: homomorphicSum,
    decryptedSum,
    isHomomorphicallyValid: decryptedSum === m1 + m2,
  });
});

app.post('/api/crypto/ring-lwe', (req, res) => {
  const { bit = 1 } = req.body;
  const kp = ringEngine.generateKeyPair();
  const ct = ringEngine.encryptBit(bit, kp);
  const decBit = ringEngine.decryptBit(ct, kp.secretKey);

  res.json({
    bit,
    keyPair: { publicKeyB: kp.publicKeyB, secretKey: kp.secretKey },
    ciphertext: { u: ct.u, v: ct.v },
    decryptedBit: decBit,
    success: decBit === bit,
  });
});

app.post('/api/crypto/kyber-kem', (req, res) => {
  const aliceKeyPair = kyberKem.generateKeypair();
  const bobEncapsulation = kyberKem.encapsulate(aliceKeyPair);
  const aliceSharedSecret = kyberKem.decapsulate(bobEncapsulation.ciphertextBits);

  res.json({
    aliceFingerprint: aliceKeyPair.publicKeyFingerprint,
    bobCiphertextBits: bobEncapsulation.ciphertextBits,
    bobSharedSecret: bobEncapsulation.sharedSecretHash,
    aliceDecapsulatedSecret: aliceSharedSecret,
    secretsMatch: bobEncapsulation.sharedSecretHash === aliceSharedSecret,
  });
});

app.post('/api/crypto/dilithium', (req, res) => {
  const { message = 'Settlement Authorization Tx #58219' } = req.body;
  const kp = dilithium.generateKeyPair();
  const signature = dilithium.sign(message, kp);
  const isValid = dilithium.verify(message, signature, kp.publicKey);

  res.json({
    algorithm: 'NIST FIPS 204 Crystals-Dilithium (ML-DSA)',
    message,
    publicKey: kp.publicKey,
    signature,
    isValid
  });
});

app.post('/api/crypto/falcon', (req, res) => {
  const { message = 'Classified Post-Quantum Transmission' } = req.body;
  const kp = falcon.generateKeyPair();
  const signature = falcon.sign(message, kp);
  const isValid = falcon.verify(message, signature, kp);

  res.json({
    algorithm: 'NIST FIPS 206 Falcon (FN-DSA)',
    message,
    publicKeyH: kp.h,
    signature,
    isValid
  });
});

app.get('/api/shor-analysis', (req, res) => {
  res.json(QuantumSecurityAnalyzer.getAlgorithmComparisons());
});

app.listen(PORT, () => {
  console.log(`🚀 Post-Quantum Lattice Crypto Engine v5.0.0 on http://localhost:${PORT}`);
});
