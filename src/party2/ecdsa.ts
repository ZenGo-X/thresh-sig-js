const path = require('path');
const bindings : any = require(path.join(__dirname, '../../../native'));
import {BigInt, EncryptionKey, FE, FE_BYTES_SIZE, GE} from '../common';
import util from 'util';
bindings.p2_ecdsa_generate_master_key = util.promisify(bindings.p2_ecdsa_generate_master_key);
bindings.p2_ecdsa_sign = util.promisify(bindings.p2_ecdsa_sign);

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

interface Party2MasterKey {
    public: Party2Public;
    private: Party2Private;
    chain_code: BigInt;
}

export class EcdsaParty2Share {
    public id: string;
    private master_key: Party2MasterKey;

    public constructor(
        p1MasterKeyId : string,
        p2MasterKey: Party2MasterKey) {
        this.id = p1MasterKeyId;
        this.master_key = p2MasterKey
    }

    public static fromPlain(plain: any) {
        return new EcdsaParty2Share(
            plain.id,
            plain.master_key);
    }

    public getPublicKey(): curve.base.BasePoint  {
        const pub = { x: this.master_key.public.q.x.toString(), y: this.master_key.public.q.y.toString() };
        const keyPair = ec.keyFromPublic(pub);
        return keyPair.getPublic();
    }
}

export class EcdsaSignature {
    constructor(public r: BigInt, public s: BigInt, public recid: number) { }

    public static fromPlain(plain: any) {
        return new EcdsaSignature(plain.r, plain.s, plain.recid);
    }

    public toBuffer(): Buffer {
        const signatureBuf: Buffer = Buffer.allocUnsafe(64);
        Buffer.from(this.r.padStart(FE_BYTES_SIZE * 2, '0'), 'hex').copy(signatureBuf, 0);
        Buffer.from(this.s.padStart(FE_BYTES_SIZE * 2, '0'), 'hex').copy(signatureBuf, 32);
        return signatureBuf;
    }
}

export class EcdsaParty2 {

    private party1Endpoint: string;

    public constructor(party1Endpoint: string) {
        this.party1Endpoint = party1Endpoint;
    }

    public async generateMasterKey(): Promise<EcdsaParty2Share> {
        const res = JSON.parse(await bindings.p2_ecdsa_generate_master_key(this.party1Endpoint));
        return EcdsaParty2Share.fromPlain(res);
    }

    public getChildShare(p2MasterKeyShare: EcdsaParty2Share, xPos: number, yPos: number): EcdsaParty2Share {
        const res = JSON.parse(bindings.p2_ecdsa_get_child_share(
            JSON.stringify(p2MasterKeyShare),
            BigInt.fromNumber(xPos),
            BigInt.fromNumber(yPos)));
        return EcdsaParty2Share.fromPlain(res);
    }

    public async sign(msgHash: Buffer, childPartyTwoShare: EcdsaParty2Share, xPos: number, yPos: number): Promise<EcdsaSignature> {
        const res = JSON.parse(await bindings.p2_ecdsa_sign(
            this.party1Endpoint,
            JSON.stringify(msgHash.toString('hex')),
            JSON.stringify(childPartyTwoShare),
            BigInt.fromNumber(xPos),
            BigInt.fromNumber(yPos)));

        return EcdsaSignature.fromPlain(res);
    }
}
