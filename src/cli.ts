#!/usr/bin/env node
import { LatticeLWEEngine } from './crypto/lattice-lwe.js';
import { HomomorphicLatticeEngine } from './crypto/homomorphic.js';

console.log(`
===========================================================
  🔐 POST-QUANTUM LATTICE & HOMOMORPHIC CRYPTO CLI [v1.0.0]
  Author: anderdebona
===========================================================
`);

const engine = new LatticeLWEEngine(8, 257);
const keyPair = engine.generateKeyPair();

console.log('🔑 Generated LWE Keypair (Dimension n=8, Modulus q=257)...');

const c1 = engine.encrypt(1, keyPair);
const c2 = engine.encrypt(2, keyPair);

const cSum = HomomorphicLatticeEngine.addHomomorphic(c1, c2, engine.modulus);
const decryptedSum = engine.decrypt(cSum, keyPair.secretKey);

console.log('\n🔒 Encrypted m1=1 and m2=2 into LWE Ciphertext vectors.');
console.log(`➕ Computed Homomorphic Addition: Enc(1) + Enc(2) = Enc(3)`);
console.log(`🔓 Decrypted Homomorphic Sum: ${decryptedSum}`);
console.log(`\n🛡️ Homomorphic Validity: ${decryptedSum === 3 ? '✅ MATCHES (3)' : '❌ ERROR'}`);
