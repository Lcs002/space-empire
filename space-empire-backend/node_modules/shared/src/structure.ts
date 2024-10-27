import { ResourcesData } from "./resources";

export enum StructureType {
    MINERAL_GATHERER = 'Mineral Gatherer',
    HOUSING = 'Housing'
}

export function getStructureData(structureType : StructureType) : StructureData {
    switch(structureType) {
        case StructureType.MINERAL_GATHERER: return new MineralGathererStructureData();
        case StructureType.HOUSING: return new HousingStructureData();
    }
}

export class StructureData {
    type: StructureType;
    cost: ResourcesData;
    size: number;
    planetUuid: any;

    constructor(type, cost, size) {
        this.type = type;
        this.cost = cost;
        this.size = size;
        this.planetUuid = null;
    }
}

export class MineralGathererStructureData extends StructureData {
    constructor() {
        super(StructureType.MINERAL_GATHERER, new ResourcesData(0, 2, 1), 1);
    }
}

export class HousingStructureData extends StructureData {
    constructor() {
        super(StructureType.HOUSING, new ResourcesData(0, 2, 0), 1);
    }
}

