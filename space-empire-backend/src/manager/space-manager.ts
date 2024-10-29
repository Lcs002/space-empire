import QuadT, { Point } from 'js-quadtree';
import { initializeGalaxy } from '../galaxyGen';
import { GetNearbyViewAction, PlanetData } from 'shared';
import { Socket } from 'socket.io';
import { PlanetManager } from './planet-manager';
import { Planet } from '../data/planet-behavior';

export namespace SpaceManager {
	export const galaxySize = 100000;
	const quadtreeBoundary = new QuadT.Box(0, 0, galaxySize, galaxySize);
	export const planetQuadTree: QuadT.QuadTree = new QuadT.QuadTree(
		quadtreeBoundary,
		{
			capacity: 10,
			removeEmptyNodes: true,
			maximumDepth: -1
		}
	);

	export function setupWebSocket(socket : Socket) {
		GetNearbyViewAction.response(socket, (params) => {
			const nearbyViewPlanets: Set<PlanetData> = new Set();

			const nearbyPoints = planetQuadTree.query(
				new QuadT.Circle(params.position.x, params.position.y, params.radius)
			);

			nearbyPoints.forEach(point => {
				const planet: Planet = PlanetManager.getPlanet(point.data.uuid);
				if (planet && planet.data.owner === params.username) {
					nearbyViewPlanets.add(planet.data);

					const view = planetQuadTree.query(new QuadT.Circle(planet.data.position.x, planet.data.position.y, 800));
					view.forEach(viewPoint => {
						const vPlanet = PlanetManager.getPlanet(viewPoint.data.uuid);
						if (vPlanet) nearbyViewPlanets.add(vPlanet.data);
					});
				}
			});

			return { planets: Array.from(nearbyViewPlanets) };  
		});
	}
}

