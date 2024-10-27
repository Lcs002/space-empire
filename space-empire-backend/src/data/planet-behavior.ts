import { getStructureData, PlanetData, StructureData, StructureType } from "shared";
import { getStructure, Structure } from "./structure-behavior";

const DEPLETION_FACTOR : number = 0.1 / 100; 

export class Planet {
    planetData : PlanetData;

    constructor(planetData : PlanetData) {
        this.planetData = planetData;
    }

    buildStructure(structureType : StructureType) {
        const structureData : StructureData = getStructureData(structureType);
        if (this.planetData.calculateAvailableStructureSize() < structureData.size) 
            throw Error('Planet size is greater than available planet structure size');

        if (this.planetData.availableResources.bio < structureData.cost.bio
        || this.planetData.availableResources.gas < structureData.cost.gas
        || this.planetData.availableResources.mineral < structureData.cost.mineral
        ) throw Error('Planet does not have sufficient resources to build the structure.');

        this.planetData.availableResources.bio -= structureData.cost.bio;
        this.planetData.availableResources.gas -= structureData.cost.gas;
        this.planetData.availableResources.mineral -= structureData.cost.mineral;

        this.planetData.structures.push(structureData);
        const structure : Structure<any> = getStructure(structureData);
        structure.install(this.planetData);
    }

    extract() {
        if (this.planetData.owner === null) return;

        const extractedBioFac = this.planetData.resources.bio * (1 + this.planetData.bonusResources.bio);
        const extractedGasFac = this.planetData.resources.gas * (1 + this.planetData.bonusResources.gas);
        const extractedMineralFac = this.planetData.resources.mineral * (1 + this.planetData.bonusResources.mineral);

        const extractedBio = extractedBioFac * this.planetData.getSizeValue()/6;
        const extractedGas = extractedGasFac * this.planetData.getSizeValue()/6;
        const extractedMineral = extractedMineralFac * this.planetData.getSizeValue()/6;

        this.planetData.availableResources.bio += extractedBio;
        this.planetData.availableResources.gas += extractedGas;
        this.planetData.availableResources.mineral += extractedMineral;

        this.planetData.resources.bio -= extractedBioFac * DEPLETION_FACTOR;
        this.planetData.resources.gas -= extractedGasFac * DEPLETION_FACTOR;
        this.planetData.resources.mineral -= extractedMineralFac * DEPLETION_FACTOR;
    }
}