import { getStructureData, PlanetData, StructureData, StructureType } from "shared";
import { getStructure, Structure } from "./structure-behavior";
import { Observable } from "./observable";

const DEPLETION_FACTOR : number = 0.1 / 100; 

export class Planet extends Observable {
    data : PlanetData;

    constructor(planetData : PlanetData) {
        super();
        this.data = planetData;
    }

    buildStructure(structureType : StructureType) {
        const structureData : StructureData = getStructureData(structureType);
        if (this.data.calculateAvailableStructureSize() < structureData.size) 
            throw Error('Planet size is greater than available planet structure size');

        if (this.data.availableResources.bio < structureData.cost.bio
        || this.data.availableResources.gas < structureData.cost.gas
        || this.data.availableResources.mineral < structureData.cost.mineral
        ) throw Error('Planet does not have sufficient resources to build the structure.');

        this.data.availableResources.bio -= structureData.cost.bio;
        this.data.availableResources.gas -= structureData.cost.gas;
        this.data.availableResources.mineral -= structureData.cost.mineral;

        this.data.structures.push(structureData);
        const structure : Structure<any> = getStructure(structureData);
        structure.install(this.data);
    }

    extract() {
        if (this.data.owner === null) return;

        const extractedBioFac = this.data.resources.bio * (1 + this.data.bonusResources.bio);
        const extractedGasFac = this.data.resources.gas * (1 + this.data.bonusResources.gas);
        const extractedMineralFac = this.data.resources.mineral * (1 + this.data.bonusResources.mineral);

        const extractedBio = extractedBioFac * this.data.getSizeValue()/6;
        const extractedGas = extractedGasFac * this.data.getSizeValue()/6;
        const extractedMineral = extractedMineralFac * this.data.getSizeValue()/6;

        this.data.availableResources.bio += extractedBio;
        this.data.availableResources.gas += extractedGas;
        this.data.availableResources.mineral += extractedMineral;

        this.data.resources.bio -= extractedBioFac * DEPLETION_FACTOR;
        this.data.resources.gas -= extractedGasFac * DEPLETION_FACTOR;
        this.data.resources.mineral -= extractedMineralFac * DEPLETION_FACTOR;
    }
}