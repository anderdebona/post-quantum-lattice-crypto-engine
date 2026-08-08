export class QuantumEntropyGenerator {
  public static generateEntropyPool(size: number = 32): Uint8Array {
    const pool = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      pool[i] = Math.floor(Math.random() * 256);
    }
    return pool;
  }
}
