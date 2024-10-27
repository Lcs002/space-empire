import { PlanetData, PlayerData, ResourcesData } from "shared";
import { planets } from "../game";

export class Player {
    playerData : PlayerData;

    constructor(playerData : PlayerData) {
        this.playerData = playerData;
    }

    calculateTotalResources() : ResourcesData {
        let total : ResourcesData = new ResourcesData(0, 0, 0);

        this.playerData.ownedPlanets.forEach((planetUuid) => {
            const planetData : PlanetData = planets.getByKey(planetUuid) as PlanetData;
            total.bio += planetData.availableResources.bio;
            total.gas += planetData.availableResources.gas;
            total.mineral += planetData.availableResources.mineral;
        });

        return total;
    }
}