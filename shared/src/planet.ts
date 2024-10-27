import { Point } from "./point";
import { ResourcesData } from "./resources";
import { StructureData, StructureType } from "./structure";

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

export class PlanetData {
    uuid: any;
    size: PlanetSizeType;
    owner: any;
    resources: ResourcesData;
    bonusResources: ResourcesData;
    availableResources: ResourcesData;
    position: Point;
    structures: Array<StructureData>;

    constructor(uuid : any, position : Point, size : PlanetSizeType, resources : ResourcesData) {
        this.uuid = uuid;
        this.position = position;
        this.size = size;
        this.resources = resources; 
        this.bonusResources = new ResourcesData(0, 0, 0);
        this.availableResources = new ResourcesData(0, 0, 0);
        this.owner = null;
        this.structures = [];
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

    calculateAvailableStructureSize() : number {
        let available = this.calculateStructureLimit();
        this.structures.forEach(structure => {
            available -= structure.size;
        });
        return available;
    }

    getSizeValue() : number {
        switch(this.size) {
            case PlanetSizeType.TINY:
                return 3; 
            case PlanetSizeType.SMALL:
                return 4.5;
            case PlanetSizeType.STANDARD:
                return 6;
            case PlanetSizeType.BIG:
                return 7.5;
            case PlanetSizeType.COLOSSAL:
                return 9;
            default:
                return 0;
        }
    }
}