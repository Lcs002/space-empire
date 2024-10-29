import { Socket } from "socket.io";
import { Planet } from "../data/planet-behavior";
import { IndexedMap } from "../util/IndexedMap";
import { BuildStructureAction, ConquerPlanetAction, GetPlanetDataAction, PlayerData, SubscribePlanetEvent, UnsubscribePlanetEvent } from "shared";
import { PlayerManager } from "./player-manager";

export namespace PlanetManager {
	export const planets: IndexedMap<string, Planet> = new IndexedMap();

	export function setupWebSocket(socket: Socket) {
		ConquerPlanetAction.response(socket, (params) => {
			const planet = planets.getByKey(params.planetUuid);
			if (!planet) 
				return { error: 'No planet with uuid ' + params.planetUuid + ' was found.' }
	
			if (planet.data.owner === params.username)
				return { error: 'You already own this planet.' }
	
			if (planet.data.owner != null) 
				return { error: 'This planet is already owned by another player.' }
	
			planet.data.owner = params.username;
			const player : PlayerData = PlayerManager.getPlayer(params.username).data;
			player.ownedPlanets.push(params.planetUuid);
	
			return { planetUuid: params.planetUuid };
		});
	
		BuildStructureAction.response(socket, (params) => {
			const planet = planets.getByKey(params.planetUuid);
			
			if (!planet) 
				return { error: 'No planet with uuid ' + params.planetUuid + ' was found.' }
	
			if (planet.data.owner != params.playerUuid) 
				return { error: 'Cant build in a planet not owned' }
		
			planet.buildStructure(params.structureType);
			return {};
		});
	
		GetPlanetDataAction.response(socket, (params) => {
			const planet = planets.getByKey(params.planetUuid);
			if (planet) {
				return {planetData: planet.data};
			} else {
				throw Error('No planet with uuid ' + params.planetUuid + ' was found.');
			}
		});
		
		SubscribePlanetEvent.response(socket, (params) => {
			const planet : Planet = planets.getByKey(params.planetUuid) as Planet;
			planet.addObserver(params.event, socket.data.username);
		});
	
		UnsubscribePlanetEvent.response(socket, (params) => {
			const planet : Planet = planets.getByKey(params.planetUuid) as Planet;
			planet.deleteObserver(params.event, socket.data.username);
		});
	}
	
	export function getPlanet(planetUuid : string) : Planet {
		return planets.getByKey(planetUuid) as Planet;
	}
	
	export function getRandomPlanet() : Planet {
		return planets.getRandom() as Planet;
	}

	export function extractResources() {
		planets.forEach((planet : Planet) => planet.extract());
	}
}