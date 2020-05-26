import {bindings} from "../bindings";
import {BigInt, DecryptionKey, EncryptionKey, FE, GE, stringifyHex} from "../common";
import {curve, ec as EC} from 'elliptic';
import {Party1} from "./base";
const CURVE = "secp256k1";
const ec = new EC(CURVE);

interface Party1Private {
    x1: FE,
    paillier_priv: DecryptionKey,
    c_key_randomness: BigInt,
}

interface Party1Public {
    q: GE,
    p1: GE,
    p2: GE,
    paillier_pub: EncryptionKey,
    c_key: BigInt
}

export class EcdsaParty1Share {

    private public: Party1Public;
    private private: Party1Private;
    private chain_code: BigInt;

    public constructor(pub: Party1Public, priv: Party1Private, chainCode: BigInt) {
        this.public = pub;
        this.private = priv;
        this.chain_code = chainCode;
    }

    public static fromPlain(plain: any) {
        return new EcdsaParty1Share(
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

export class EcdsaParty1 extends Party1 {

    public constructor(rocksDbDir?: string) {
        super(rocksDbDir);
    }

    public async getMasterKey(masterKeyId: string): Promise<EcdsaParty1Share> {
        if (!this.getRocksDb()) {
            throw new Error('RocksDB not initialized. The DB path should be passed in the constructor.')
        }

        const searchString = `pass_through_guest_user_${masterKeyId}_Party1MasterKey`;
        await this.getRocksDb().open({ readOnly: true });
        return JSON.parse(await this.getRocksDb().get(searchString, {asBuffer: false}));
    }

    public getChildShare(p1MasterKeyShare: EcdsaParty1Share, xPos: number, yPos: number): EcdsaParty1Share {
        const res = JSON.parse(bindings.p1_ecdsa_get_child_share(
            JSON.stringify(p1MasterKeyShare),
            stringifyHex(xPos),
            stringifyHex(yPos)));
        return EcdsaParty1Share.fromPlain(res);
    }
}