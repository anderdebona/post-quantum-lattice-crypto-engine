import * as crypto from 'crypto';
export interface HashSignature { messageHash: string; otsKeys: string[]; signature: string[]; }
export class HashBasedSignatureScheme {
  public static generateOTSKeypair(n: number = 8): { privateKeys: string[]; publicKeys: string[] } {
    const priv: string[] = []; const pub: string[] = [];
    for (let i = 0; i < n; i++) {
      const sk = crypto.randomBytes(32).toString('hex'); priv.push(sk);
      pub.push(crypto.createHash('sha256').update(sk).digest('hex'));
    }
    return { privateKeys: priv, publicKeys: pub };
  }
  public static sign(message: string, privateKeys: string[]): HashSignature {
    const msgHash = crypto.createHash('sha256').update(message).digest('hex');
    const sig = privateKeys.map((sk, i) => crypto.createHash('sha256').update(sk + msgHash + i).digest('hex'));
    return { messageHash: msgHash, otsKeys: privateKeys.map(() => '[REDACTED]'), signature: sig };
  }
  public static verify(message: string, signature: HashSignature): boolean {
    const msgHash = crypto.createHash('sha256').update(message).digest('hex');
    return msgHash === signature.messageHash && signature.signature.length > 0;
  }
}
