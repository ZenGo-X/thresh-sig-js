import {bindings} from "../bindings";
import RocksDB from 'rocksdb';
import util from "util";
import path from "path";

export class Party1 {

    private static ROCKSDB_PATH = path.join(__dirname, '../../../db');

    private rocksdb: any;  // 2P-Sign messages DB

    public constructor() {
        this.initRocksDb();
    }

    public launchServer() {
        bindings.p1_launch_server();
    }

    protected getRocksDb() {
        return this.rocksdb;
    }

    private initRocksDb() {
        this.rocksdb = RocksDB(Party1.ROCKSDB_PATH);
        this.rocksdb.open = util.promisify(this.rocksdb.open);
        this.rocksdb.get = util.promisify(this.rocksdb.get);
    }
}