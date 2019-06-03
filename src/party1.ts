import {bindings} from "./bindings";

export class Party1 {

    public constructor() {}

    public launchServer() {
        bindings.ecdsa_p1_launch_server();
    }
}