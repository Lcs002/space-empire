import { Point } from "./point";
import { Resources } from "./resources";

export enum StructureTypes {
    MINERAL_GATHERER = 'Mineral Gatherer',
    HOUSING = 'Housing',
};

export enum PlanetSizes {
    TINY = 'Tiny',
    SMALL = 'Small',
    STANDARD = 'Standard',
    BIG = 'Big',
    COLOSSAL = 'Colossal'
}

export enum StructureLimits {
    TINY = 2,
    SMALL = 3,
    STANDARD = 4,
    BIG = 5,
    COLOSSAL = 6,
};

export class Planet {
    uuid: any;
    size: PlanetSizes;
    owner: any;
    resources: Resources;
    position: Point;
    structures: Array<StructureTypes>;
    basePopulationCapacity: number;
    structureLimit: number;

    constructor(uuid : any, position : Point, size : PlanetSizes, resources : Resources) {
        this.uuid = uuid;
        this.position = position;
        this.size = size;
        this.resources = resources; 
        this.owner = null;
        this.structures = [];
        this.basePopulationCapacity = this.calculatePopulationCapacity();
        this.structureLimit = this.calculateStructureLimit();
    }

    calculatePopulationCapacity() : number {
        switch (this.size) {
            case PlanetSizes.TINY:
                return 5; 
            case PlanetSizes.SMALL:
                return 10;
            case PlanetSizes.STANDARD:
                return 20;
            case PlanetSizes.BIG:
                return 40;
            case PlanetSizes.COLOSSAL:
                return 80;
            default:
                return 0;
        }
    }

    calculateStructureLimit() : number {
        switch(this.size) {
            case PlanetSizes.TINY:
                return 2; 
            case PlanetSizes.SMALL:
                return 3;
            case PlanetSizes.STANDARD:
                return 4;
            case PlanetSizes.BIG:
                return 5;
            case PlanetSizes.COLOSSAL:
                return 6;
            default:
                return 0;
        }
    }

    canBuild() : Boolean {
        const currentCount = this.structures.length;
        return currentCount < this.structureLimit;
    }

    buildStructure(structureType : StructureTypes) {
        if (this.canBuild()) {
            this.structures.push(structureType);
            return true;
        }
        return false;
    }

    gatherMinerals() {
        const gatherRate = this.resources.mineral * 0.1; // Example: 10% of minerals per second
        const structures = this.structures.find(obj => obj == StructureTypes.MINERAL_GATHERER)?.length
        if (structures) return gatherRate * structures;
        return 0;
    }
}