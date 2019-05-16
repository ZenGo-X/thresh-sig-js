export class BigInt extends String {
    public static fromNumber(n: number) {
        return JSON.stringify(n.toString(16));
    }
}

export type FE = BigInt;
export const FE_BYTES_SIZE = 32;

export interface GE {
    x: BigInt,
    y: BigInt
}

export interface EncryptionKey {
    n: BigInt;
}