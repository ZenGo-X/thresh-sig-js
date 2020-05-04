import {bindings} from "./bindings";
import RocksDB from 'rocksdb';
import util from "util";
import path from "path";
import {BigInt, DecryptionKey, EncryptionKey, FE, GE} from "./common";
import {curve, ec as EC} from 'elliptic';
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

export class Party1 {

    private static ROCKSDB_PATH = path.join(__dirname, '../../db');

    private rocksdb: any;  // 2P-Sign messages DB

    public constructor() {
        this.initRocksDb();
    }

    public launchServer() {
        bindings.p1_launch_server();
    }

    public async getMasterKey(p1MasterKeyId: string): Promise<EcdsaParty1Share> {
        const searchString = `pass_through_guest_user_${p1MasterKeyId}_Party1MasterKey`;
        await this.rocksdb.open({ readOnly: true });
        return JSON.parse(await this.rocksdb.get(searchString, {asBuffer: false}));
    }

    private initRocksDb() {
        this.rocksdb = RocksDB(Party1.ROCKSDB_PATH);
        this.rocksdb.open = util.promisify(this.rocksdb.open);
        this.rocksdb.get = util.promisify(this.rocksdb.get);
    }
}