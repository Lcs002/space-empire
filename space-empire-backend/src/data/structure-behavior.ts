import { HousingStructureData, MineralGathererStructureData, PlanetData, StructureData, StructureType } from "shared";
import { planets } from "../game";

export abstract class Structure<T extends StructureData> {
    structureData : T;
    
    constructor(structureData : T) {
        this.structureData = structureData;
    }

    install(planetData : PlanetData) : void {
        if (this.structureData.planetUuid != null) return;
        this.structureData.planetUuid = planetData.uuid;
        this._install(planetData);
    }

    uninstall() : void {
        if (this.structureData.planetUuid == null) return;
        this._uninstall();
        this.structureData.planetUuid = null;
    }

    abstract _install(planetData : PlanetData) : void;
    abstract _uninstall() : void;
}

export class MineralGathererStructure extends Structure<MineralGathererStructureData> {
    _install(planetData: PlanetData): void {
        planetData.bonusResources.mineral += 0.2;
    }
    _uninstall(): void {
        const planetData : PlanetData = planets.getByKey(this.structureData.planetUuid) as PlanetData;
        planetData.bonusResources.mineral -= 0.2;
    }
}

export class HousingStructure extends Structure<HousingStructureData> {
    _install(planetData: PlanetData): void {
        planetData.bonusResources.bio += 0.1;
    }
    _uninstall(): void {
        const planetData : PlanetData = planets.getByKey(this.structureData.planetUuid) as PlanetData;
        planetData.bonusResources.bio -= 0.1;
    }
}

export function getStructure<T extends StructureData>(structureData: T): Structure<T> {
    switch (structureData.type) {
        case StructureType.MINERAL_GATHERER:
            return new MineralGathererStructure(structureData as MineralGathererStructureData) as Structure<T>;
        case StructureType.HOUSING:
            return new HousingStructure(structureData as HousingStructureData) as Structure<T>;
        default:
            throw new Error(`Unknown structure type: ${structureData.type}`);
    }
}