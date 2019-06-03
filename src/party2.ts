const bindings : any = require('../../native');
import {BigInt, EncryptionKey, FE, FE_BYTES_SIZE, GE} from './common';
import util from 'util';
bindings.ecdsa_p2_generate_master_key = util.promisify(bindings.ecdsa_p2_generate_master_key);
bindings.ecdsa_p2_sign = util.promisify(bindings.ecdsa_p2_sign);

import {curve, ec as EC} from 'elliptic';
const CURVE = "secp256k1";
const ec = new EC(CURVE);

interface Party2Private {
    x2: FE;
}

interface Party2Public {
    q: GE;
    p2: GE;
    p1: GE;
    paillier_pub: EncryptionKey;
    c_key: BigInt;
}

export class Party2Share {
    public p1MasterKeyId: string;
    private public: Party2Public;
    private private: Party2Private;
    private chain_code: BigInt;

    public constructor(
        p1MasterKeyId : string,
        party2Public : Party2Public,
        party2Private: Party2Private,
        chain_code: BigInt) {
        this.p1MasterKeyId = p1MasterKeyId;
        this.public = party2Public;
        this.private  = party2Private;
        this.chain_code = chain_code;
    }

    public static fromPlain(plain: any, p1MasterKeyId: string) {
        return new Party2Share(
            p1MasterKeyId,
            plain.public,
            plain.private,
            plain.chain_code);
    }

    public getPublicKey(): curve.base.BasePoint  {
        const pub = { x: this.public.q.x.toString(), y: this.public.q.y.toString() };
        const keyPair = ec.keyFromPublic(pub);
        return keyPair.getPublic();
    }
}

export class Signature {
    constructor(public r: BigInt, public s: BigInt, public recid: number) { }

    public static fromPlain(plain: any) {
        return new Signature(plain.r, plain.s, plain.recid);
    }

    public toBuffer(): Buffer {
        const signatureBuf: Buffer = Buffer.allocUnsafe(64);
        Buffer.from(this.r.padStart(FE_BYTES_SIZE * 2, '0'), 'hex').copy(signatureBuf, 0);
        Buffer.from(this.s.padStart(FE_BYTES_SIZE * 2, '0'), 'hex').copy(signatureBuf, 32);
        return signatureBuf;
    }
}

export class Party2 {

    private party1Endpoint: string;

    public constructor(party1Endpoint: string) {
        this.party1Endpoint = party1Endpoint;
    }

    public async generateMasterKey(): Promise<Party2Share> {
        const res = JSON.parse(await bindings.ecdsa_p2_generate_master_key(this.party1Endpoint));
        return Party2Share.fromPlain(res.master_key, res.id);
    }

    public getChildShare(p2MasterKeyShare: Party2Share, xPos: number, yPos: number): Party2Share {
        const res = JSON.parse(bindings.ecdsa_p2_get_child_share(
            JSON.stringify(p2MasterKeyShare),
            BigInt.fromNumber(xPos),
            BigInt.fromNumber(yPos)));

        return Party2Share.fromPlain(res, p2MasterKeyShare.p1MasterKeyId);
    }

    public async sign(msgHash: Buffer, childPartyTwoShare: Party2Share, xPos: number, yPos: number): Promise<Signature> {
        const res = JSON.parse(await bindings.ecdsa_p2_sign(
            this.party1Endpoint,
            JSON.stringify(msgHash.toString('hex')),
            JSON.stringify(childPartyTwoShare),
            BigInt.fromNumber(xPos),
            BigInt.fromNumber(yPos),
            childPartyTwoShare.p1MasterKeyId));

        return Signature.fromPlain(res);
    }
}
