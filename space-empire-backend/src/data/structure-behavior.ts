import { HousingStructureData, MineralGathererStructureData, PlanetData, StructureData, StructureType } from "shared";
import { planets } from "../game";
import { Planet } from "./planet-behavior";

export abstract class Structure<T extends StructureData> {
    data : T;
    
    constructor(structureData : T) {
        this.data = structureData;
    }

    install(planet : Planet) : void {
        if (this.data.planetUuid != null) return;
        this.data.planetUuid = planet.data.uuid;
        this._install(planet);
    }

    uninstall() : void {
        if (this.data.planetUuid == null) return;
        this._uninstall();
        this.data.planetUuid = null;
    }

    abstract _install(planet : Planet) : void;
    abstract _uninstall() : void;
}

export class MineralGathererStructure extends Structure<MineralGathererStructureData> {
    _install(planet: Planet): void {
        planet.data.bonusResources.mineral += 0.2;
    }
    _uninstall(): void {
        const planet : Planet = planets.getByKey(this.data.planetUuid) as Planet;
        planet.data.bonusResources.mineral -= 0.2;
    }
}

export class HousingStructure extends Structure<HousingStructureData> {
    _install(planet: Planet): void {
        planet.data.bonusResources.bio += 0.1;
    }
    _uninstall(): void {
        const planet : Planet = planets.getByKey(this.data.planetUuid) as Planet;
        planet.data.bonusResources.bio -= 0.1;
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