export type BigInt = string;
export type FE = BigInt;
export const FE_BYTES_SIZE = 32;

export function stringifyHex(n: number) {
    return JSON.stringify(n.toString(16));
}

export interface GE {
    x: BigInt,
    y: BigInt
}

export interface DecryptionKey {
    p: BigInt,
    q: BigInt,
}

export interface EncryptionKey {
    n: BigInt;
}

export function toLittleEndian(buffer: Buffer) {
    if (buffer.length < 1) {
        return buffer;
    }
    let j = buffer.length - 1;
    let tmp = 0;
    for (let i = 0; i < buffer.length / 2; i++) {
        tmp = buffer[i];
        buffer[i] = buffer[j];
        buffer[j] = tmp;
        j--;
    }

    return buffer;
}