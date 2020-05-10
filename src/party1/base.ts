import {bindings} from "../bindings";
import RocksDB from 'rocksdb';
import util from "util";
import path from "path";

export class Party1 {

    private rocksdb: any;  // 2P-Sign messages DB

    public constructor(rocksDbDir?: string) {
        if (rocksDbDir) {
            this.initRocksDb(rocksDbDir);
        }
    }

    public launchServer() {
        bindings.p1_launch_server();
    }

    protected getRocksDb() {
        return this.rocksdb;
    }

    private initRocksDb(rocksDbDir: string) {
        this.rocksdb = RocksDB(rocksDbDir);
        this.rocksdb.open = util.promisify(this.rocksdb.open);
        this.rocksdb.get = util.promisify(this.rocksdb.get);
    }
}