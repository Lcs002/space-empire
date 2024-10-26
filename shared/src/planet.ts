import { Point } from "./point";
import { Resources } from "./resources";

export enum StructureType {
    MINERAL_GATHERER = 'Mineral Gatherer',
    HOUSING = 'Housing',
};

export enum PlanetSizeType {
    TINY = 'Tiny',
    SMALL = 'Small',
    STANDARD = 'Standard',
    BIG = 'Big',
    COLOSSAL = 'Colossal'
}

export const PlanetSizeInfos : Map<PlanetSizeType, PlanetSizeInfo> = new Map<PlanetSizeType, PlanetSizeInfo>([
    [PlanetSizeType.TINY, {value: 3, structureLimits: 2}],
    [PlanetSizeType.SMALL, {value: 4.5, structureLimits: 3}],
    [PlanetSizeType.STANDARD, {value: 6, structureLimits: 4}],
    [PlanetSizeType.BIG, {value: 7.5, structureLimits: 5}],
    [PlanetSizeType.COLOSSAL, {value: 9, structureLimits: 6}]
]) 

export interface PlanetSizeInfo {
    value : number;
    structureLimits : number;
}

export class Planet {
    uuid: any;
    size: PlanetSizeType;
    owner: any;
    resources: Resources;
    position: Point;
    structures: Array<StructureType>;
    basePopulationCapacity: number;
    structureLimit: number;

    constructor(uuid : any, position : Point, size : PlanetSizeType, resources : Resources) {
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
            case PlanetSizeType.TINY:
                return 5; 
            case PlanetSizeType.SMALL:
                return 10;
            case PlanetSizeType.STANDARD:
                return 20;
            case PlanetSizeType.BIG:
                return 40;
            case PlanetSizeType.COLOSSAL:
                return 80;
            default:
                return 0;
        }
    }

    calculateStructureLimit() : number {
        switch(this.size) {
            case PlanetSizeType.TINY:
                return 2; 
            case PlanetSizeType.SMALL:
                return 3;
            case PlanetSizeType.STANDARD:
                return 4;
            case PlanetSizeType.BIG:
                return 5;
            case PlanetSizeType.COLOSSAL:
                return 6;
            default:
                return 0;
        }
    }

    getSizeValue() : number {
        return (PlanetSizeInfos.get(this.size) as PlanetSizeInfo).value;
    }

    canBuild() : Boolean {
        const currentCount = this.structures.length;
        return currentCount < this.structureLimit;
    }

    buildStructure(structureType : StructureType) {
        if (this.canBuild()) {
            this.structures.push(structureType);
            return true;
        }
        return false;
    }
}