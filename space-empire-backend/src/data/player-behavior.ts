import { PlanetData, PlayerData, ResourcesData } from "shared";
import { planets } from "../game";
import { Planet } from "./planet-behavior";

export class Player {
    data : PlayerData;

    constructor(playerData : PlayerData) {
        this.data = playerData;
    }

    calculateTotalResources() : ResourcesData {
        let total : ResourcesData = new ResourcesData(0, 0, 0);

        this.data.ownedPlanets.forEach((planetUuid) => {
            const planet : Planet = planets.getByKey(planetUuid) as Planet;
            total.bio += planet.data.availableResources.bio;
            total.gas += planet.data.availableResources.gas;
            total.mineral += planet.data.availableResources.mineral;
        });

        return total;
    }
}