# Post-Quantum Lattice Cryptography Engine 🛡️ 🔐

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Version](https://img.shields.io/badge/Version-v5.0.0%20Ultra-00d2ff?style=for-the-badge)](https://github.com/anderdebona/post-quantum-lattice-crypto-engine)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-Passing%20100%25-success?style=for-the-badge&logo=githubactions)](https://github.com/anderdebona/post-quantum-lattice-crypto-engine/actions)

<br />

**PhD-Grade Post-Quantum Lattice Cryptography: NIST FIPS 204 Crystals-Dilithium (ML-DSA), NIST FIPS 206 Falcon (FN-DSA), Kyber-KEM Key Exchange & Ring-LWE Homomorphic Arithmetic**

*Engineered with precision by **[anderdebona](https://github.com/anderdebona)***

</div>

---

## 📌 Academic Purpose & Mathematical Foundation

This repository implements post-quantum cryptographic schemes based on hard lattice problems (Shortest Vector Problem $\text{SVP}_\gamma$, Learning With Errors $\text{LWE}$, and Ring-LWE). These hardness assumptions are immune to polynomial-time quantum attacks via Shor's algorithm ($O((\log N)^3)$).

---

## 🔬 Mathematical Formulations

### 1. Crystals-Dilithium (ML-DSA NIST FIPS 204)
Rejection sampling in polynomial quotient ring $\mathcal{R}_q = \mathbb{Z}_q[X]/(X^{256} + 1)$:
$$z = y + c \cdot s_1 \quad \text{s.t.} \quad \|z\|_\infty < \gamma_1 - \beta$$

### 2. Falcon NTRU Fast Fourier Signature (FN-DSA NIST FIPS 206)
Verification over dyadic FFT tree with Euclidean norm radius:
$$\|(s_1, s_2)\|_2 \le \lfloor 1.17 \sigma \sqrt{2N} \rfloor$$

---

## ⚡ What's New in v5.0.0

- 📜 **`DilithiumMLDSAEngine`**: NIST FIPS 204 Module-Lattice digital signatures with high/low bit decomposition and rejection sampling.
- 🦅 **`FalconFNDSAEngine`**: NIST FIPS 206 Fast Fourier Orthogonalization NTRU lattice trapdoor signatures.
- 🎛️ **Studio v5.0.0**: Interactive Dilithium and Falcon signing/verification studios with real-time norm inspection.
- 🧪 **14/14 Tests Passing**: Complete Vitest validation for LWE, Ring-LWE, Kyber-KEM, Dilithium, and Falcon.

---

## 🚀 Quickstart & Interactive Studio

```bash
git clone https://github.com/anderdebona/post-quantum-lattice-crypto-engine.git
cd post-quantum-lattice-crypto-engine
npm install
npm test
npm run build
npm start
# Open http://localhost:3005
```

---

## 📄 License & Citation
MIT License © 2026 anderdebona. See [CITATION.cff](CITATION.cff) for academic attribution.
