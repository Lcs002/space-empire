import { ResourceTypes } from "./resources";

export class Player {
    username : any;
    password : any;
    ownedPlanets : Array<string>;
    resources : Map<ResourceTypes, number>;
    resourcesPerSec : Map<ResourceTypes, number>;

    constructor(username : string, password : any) {
        this.username = username;
        this.password = password;
        this.ownedPlanets = new Array<string>();
        this.resources = new Map<ResourceTypes, number>();
        this.resourcesPerSec = new Map<ResourceTypes, number>();
    }
}