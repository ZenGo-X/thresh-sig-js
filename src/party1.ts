import {bindings} from "./bindings";

export class Party1 {

    public constructor() {}

    public launchServer() {
        bindings.p1_launch_server();
    }
}