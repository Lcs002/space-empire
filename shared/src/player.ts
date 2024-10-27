import { ResourceTypes } from "./resources";

export class PlayerData {
    username : any;
    password : any;
    ownedPlanets : Array<string>;

    constructor(username : string, password : any) {
        this.username = username;
        this.password = password;
        this.ownedPlanets = new Array<string>();
    }
}