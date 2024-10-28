import QuadT, { Point } from 'js-quadtree';
import { Server, Socket } from 'socket.io';
import { BuildStructureAction, ConquerPlanetAction, GetNearbyViewAction, GetPlanetDataAction, GetPlayerDataAction, getStructureData, PlanetData, PlayerData, StructureData, StructureType } from 'shared';
import { initializeGalaxy } from './galaxyGen';
import { users } from './server';
import { IndexedMap } from './util/IndexedMap';
import { getStructure, Structure } from './data/structure-behavior';
import { Planet } from './data/planet-behavior';

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
  initializeLoop();
}

function initializeLoop() {
  setInterval(() => {
    planets.forEach((planet : Planet) => {
      planet.extract();
    })
  }, 1000);
}

export function handleConnection(socket: Socket) {
  console.log(`A user connected: ${socket.data.username}`);
  socket.join(socket.data.username);

  GetNearbyViewAction.response(socket, (params) => {
    const nearbyViewPlanets: Set<PlanetData> = new Set();

    const nearbyPoints = planetQuadTree.query(
      new QuadT.Circle(params.position.x, params.position.y, params.radius)
    );

    nearbyPoints.forEach(point => {
      const planet: Planet = planets.getByKey(point.data.uuid) as Planet;
      if (planet && planet.data.owner === params.username) {
        nearbyViewPlanets.add(planet.data);

        const view = planetQuadTree.query(new QuadT.Circle(planet.data.position.x, planet.data.position.y, 800));
        view.forEach(viewPoint => {
          const vPlanet = planets.getByKey(viewPoint.data.uuid) as Planet;

          if (vPlanet) nearbyViewPlanets.add(vPlanet.data);
        });
      }
    });

    return { planets: Array.from(nearbyViewPlanets) };  
  });

  ConquerPlanetAction.response(socket, (params) => {
    const planet = planets.getByKey(params.planetUuid);
    if (!planet) 
      return { error: 'No planet with uuid ' + params.planetUuid + ' was found.' }

    if (planet.data.owner === params.username)
      return { error: 'You already own this planet.' }

    if (planet.data.owner != null) 
      return { error: 'This planet is already owned by another player.' }

    planet.data.owner = params.username;
    const player : PlayerData = users[params.username];
    player.ownedPlanets.push(params.planetUuid);
    // TODO Broadcast to the owner and the near players
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

  GetPlayerDataAction.response(socket, (params) => {
    const playerData : PlayerData = users[params.playerUuid];
    return {player: playerData};
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
}
