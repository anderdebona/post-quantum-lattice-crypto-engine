export interface QuantumVulnerabilityComparison {
  algorithm: string;
  securityClass: 'CLASSICAL' | 'POST_QUANTUM';
  shorAlgorithmVulnerability: boolean;
  quantumTimeComplexity: string;
  underlyingHardProblem: string;
}

export class QuantumSecurityAnalyzer {
  public static getAlgorithmComparisons(): QuantumVulnerabilityComparison[] {
    return [
      {
        algorithm: 'RSA-2048 / RSA-4096',
        securityClass: 'CLASSICAL',
        shorAlgorithmVulnerability: true,
        quantumTimeComplexity: 'O(log^3 N) [Polynomial Time Break]',
        underlyingHardProblem: 'Integer Factorization (IFP)',
      },
      {
        algorithm: 'ECDSA / ECC (Secp256k1)',
        securityClass: 'CLASSICAL',
        shorAlgorithmVulnerability: true,
        quantumTimeComplexity: 'O(log^3 N) [Polynomial Time Break]',
        underlyingHardProblem: 'Elliptic Curve Discrete Logarithm (ECDLP)',
      },
      {
        algorithm: 'Lattice-LWE (Kyber / Dilithium / Ours)',
        securityClass: 'POST_QUANTUM',
        shorAlgorithmVulnerability: false,
        quantumTimeComplexity: 'O(2^(c * n)) [Exponential Quantum Resistance]',
        underlyingHardProblem: 'Learning With Errors (LWE) / Shortest Vector Problem (SVP)',
      },
    ];
  }
}
