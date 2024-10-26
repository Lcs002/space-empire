import QuadT, { Point } from 'js-quadtree';
import { Server, Socket } from 'socket.io';
import { Planet, Player, ws_response_conquerPlanet, ws_response_getNearbyView as ws_response_getNearbyView, ws_response_getPlanetData, ws_response_getPlayerData } from 'shared';
import { initializeGalaxy } from './galaxyGen';
import { users } from './server';
import { IndexedMap } from './util/IndexedMap';

const galaxySize = 100000;
const quadtreeBoundary = new QuadT.Box(0, 0, galaxySize, galaxySize);

// Initialize quadtree and planets map
export const planets: IndexedMap<string, Planet> = new IndexedMap();
export const planetQuadTree: QuadT.QuadTree = new QuadT.QuadTree(
    quadtreeBoundary,
    {
        capacity: 10,
        removeEmptyNodes: true,
        maximumDepth: -1
    }
);

// Function to initialize the game state (galaxy)
export function initializeGame() {
  initializeGalaxy(galaxySize, planets, planetQuadTree);
}

// Function to handle new WebSocket connections
export function handleConnection(socket: Socket) {
  console.log('A user connected');

  ws_response_getNearbyView(socket, (params) => {
    const player : Player = users[params.username];
    const nearbyViewPlanets: Set<Planet> = new Set();

    const nearbyPoints = planetQuadTree.query(
      new QuadT.Circle(params.position.x, params.position.y, params.radius)
    );

    nearbyPoints.forEach(point => {
      const planet: Planet = planets.getByKey(point.data.uuid) as Planet;
      if (planet && planet.owner === params.username) {
        nearbyViewPlanets.add(planet);

        const view = planetQuadTree.query(new QuadT.Circle(planet.position.x, planet.position.y, 800));
        view.forEach(viewPoint => {
          const vPlanet = planets.getByKey(viewPoint.data.uuid) as Planet;

          if (vPlanet) nearbyViewPlanets.add(vPlanet);
        });
      }
    });

    return { planets: Array.from(nearbyViewPlanets) };  
  });
  
  ws_response_conquerPlanet(socket, (params) => {
    const planet = planets.getByKey(params.planetUuid);
    if (planet) {
      if (planet.owner === null) {
        planet.owner = params.username;
        const player : Player = users[params.username];
        player.ownedPlanets.push(params.planetUuid);
        // TODO Broadcast to the owner and the near players
        return { planetUuid: params.planetUuid };
      } else {
        return { error: 'This planet is already owned by another player.' };
      }
    }
    return { error: 'No planet with uuid ' + params.planetUuid + ' was found.' }
  });

  ws_response_getPlanetData(socket, (params) => {
    const planet : Planet | undefined = planets.getByKey(params.planetUuid);
    if (planet) {
      return {planet: planet};
    } else {
      throw Error('No planet with uuid ' + params.planetUuid + ' was found.');
    }
  });

  ws_response_getPlayerData(socket, (params) => {
    const player : Player = users[params.playerUuid];
    return {player: player};
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
}
