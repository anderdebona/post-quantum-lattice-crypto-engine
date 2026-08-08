import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { LatticeLWEEngine } from './crypto/lattice-lwe.js';
import { HomomorphicLatticeEngine } from './crypto/homomorphic.js';
import { QuantumSecurityAnalyzer } from './crypto/shor-comparison.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3005;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const engine = new LatticeLWEEngine(8, 257);
const keyPair = engine.generateKeyPair();

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

  // Homomorphic addition without server decryption
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

app.get('/api/shor-analysis', (req, res) => {
  res.json(QuantumSecurityAnalyzer.getAlgorithmComparisons());
});

app.listen(PORT, () => {
  console.log(`🚀 Post-Quantum Lattice Crypto Engine running on http://localhost:${PORT}`);
});
