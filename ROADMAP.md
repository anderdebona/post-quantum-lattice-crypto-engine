# 🗺️ Strategic Roadmap: Post-Quantum Lattice Crypto Engine

Welcome to the vanguard of NIST Post-Quantum Cryptography (PQC), Ring-LWE, ML-KEM, and Homomorphic Encryption.

---

## 🎯 Release Milestones

### 📍 v4.0.0 — The Ring-LWE & Kyber-KEM Era (Current)
- [x] Standard Learning With Errors (LWE) secret key & ciphertext vectors.
- [x] Partially homomorphic addition $\text{Enc}(m_1) \oplus \text{Enc}(m_2)$.
- [x] Lattice digital signatures & Lamport-style OTS schemes.
- [x] **RingLWEEncryptionScheme**: Negacyclic convolution polynomial encryption.
- [x] **KyberKemKeyExchange**: NIST ML-KEM post-quantum key encapsulation.

### 📍 v4.5.0 — Fully Homomorphic Encryption (FHE / CKKS) (Q4 2026)
- [ ] Ring-GSW / CKKS bootstrap evaluation on encrypted floating-point tensors.
- [ ] Dilithium / ML-DSA signature scheme implementation with rejection sampling.
- [ ] Hardware acceleration via AVX-512 Number Theoretic Transform (NTT).

---

## 🤝 Community Call for Contributions

We welcome issues and PRs in:
- 🛡️ Lattice reduction attack simulations (BKZ, LLL basis reduction).
- 🔐 TLS 1.3 hybrid post-quantum key exchange (X25519 + Kyber768) handshake mocks.
