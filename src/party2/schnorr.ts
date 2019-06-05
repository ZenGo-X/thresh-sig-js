const bindings : any = require('../../../native');
import {GE, FE, FE_BYTES_SIZE} from "../common";
import util from 'util';
bindings.p2_schnorr_generate_key = util.promisify(bindings.p2_schnorr_generate_key);
bindings.p2_schnorr_sign = util.promisify(bindings.p2_schnorr_sign);

import {curve, ec as EC} from 'elliptic';
const CURVE = "secp256k1";
const ec = new EC(CURVE);

interface ShamirSecretSharing {
    threshold: number;
    share_count: number;
}

interface SharedKey {
    y: GE;
    x_i: FE;
}

interface VerifiableVss {
    parameters: ShamirSecretSharing;
    commitments: GE[];
}

export class SchnorrParty2Share {

    public constructor(
        public id: string,
        private shared_key: SharedKey,
        private vss_scheme_vec: VerifiableVss[]) {
    }

    public static fromPlain(plain: any) {
        return new SchnorrParty2Share(
            plain.id,
            plain.shared_key,
            plain.vss_scheme_vec);
    }

    public getPublicKey(): curve.base.BasePoint  {
        const pub = { x: this.shared_key.y.x.toString(), y: this.shared_key.y.y.toString() };
        const keyPair = ec.keyFromPublic(pub);
        return keyPair.getPublic();
    }
}

export class SchnorrSignature {
    constructor(public e: FE, public s: FE) { }

    public static fromPlain(plain: any) {
        return new SchnorrSignature(plain.e, plain.s);
    }

    public toBuffer(): Buffer {
        const signatureBuf: Buffer = Buffer.allocUnsafe(64);
        Buffer.from(this.e.padStart(FE_BYTES_SIZE * 2, '0'), 'hex').copy(signatureBuf, 0);
        Buffer.from(this.s.padStart(FE_BYTES_SIZE * 2, '0'), 'hex').copy(signatureBuf, 32);
        return signatureBuf;
    }
}

export class SchnorrParty2 {

    private party1Endpoint: string;

    public constructor(party1Endpoint: string) {
        this.party1Endpoint = party1Endpoint;
    }

    public async generateKey(): Promise<SchnorrParty2Share> {
        const res = JSON.parse(await bindings.p2_schnorr_generate_key(this.party1Endpoint));
        return SchnorrParty2Share.fromPlain(res);
    }

    public async sign(msgHash: Buffer, share: SchnorrParty2Share): Promise<SchnorrSignature> {
        const res = JSON.parse(await bindings.p2_schnorr_sign(
            this.party1Endpoint,
            JSON.stringify(msgHash.toString('hex')),
            JSON.stringify(share)));
        return SchnorrSignature.fromPlain(res);
    }
}
