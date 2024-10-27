import QuadT, { Point } from 'js-quadtree';
import { Server, Socket } from 'socket.io';
import { getStructureData, PlanetData, PlayerData, StructureData, StructureType, ws_response_buildStructure, ws_response_conquerPlanet, ws_response_getNearbyView as ws_response_getNearbyView, ws_response_getPlanetData, ws_response_getPlayerData } from 'shared';
import { initializeGalaxy } from './galaxyGen';
import { users } from './server';
import { IndexedMap } from './util/IndexedMap';
import { getStructure, Structure } from './data/structure-behavior';
import { Planet } from './data/planet-behavior';

const galaxySize = 100000;
const quadtreeBoundary = new QuadT.Box(0, 0, galaxySize, galaxySize);

// Initialize quadtree and planets map
export const planets: IndexedMap<string, PlanetData> = new IndexedMap();
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
    planets.forEach((planetData : PlanetData) => {
      const planet : Planet = new Planet(planetData);
      planet.extract();
    })
  }, 1000);
}

// Function to handle new WebSocket connections
export function handleConnection(socket: Socket) {
  console.log('A user connected');

  ws_response_getNearbyView(socket, (params) => {
    const nearbyViewPlanets: Set<PlanetData> = new Set();

    const nearbyPoints = planetQuadTree.query(
      new QuadT.Circle(params.position.x, params.position.y, params.radius)
    );

    nearbyPoints.forEach(point => {
      const planetData: PlanetData = planets.getByKey(point.data.uuid) as PlanetData;
      if (planetData && planetData.owner === params.username) {
        nearbyViewPlanets.add(planetData);

        const view = planetQuadTree.query(new QuadT.Circle(planetData.position.x, planetData.position.y, 800));
        view.forEach(viewPoint => {
          const vPlanet = planets.getByKey(viewPoint.data.uuid) as PlanetData;

          if (vPlanet) nearbyViewPlanets.add(vPlanet);
        });
      }
    });

    return { planets: Array.from(nearbyViewPlanets) };  
  });
  
  ws_response_conquerPlanet(socket, (params) => {
    const planetData = planets.getByKey(params.planetUuid);
    if (!planetData) 
      return { error: 'No planet with uuid ' + params.planetUuid + ' was found.' }

    if (planetData.owner === params.username)
      return { error: 'You already own this planet.' }

    if (planetData.owner != null) 
      return { error: 'This planet is already owned by another player.' }

    planetData.owner = params.username;
    const player : PlayerData = users[params.username];
    player.ownedPlanets.push(params.planetUuid);
    // TODO Broadcast to the owner and the near players
    return { planetUuid: params.planetUuid };
  });

  ws_response_buildStructure(socket, (params) => {
    const planetData = planets.getByKey(params.planetUuid);
    
    if (!planetData) 
      return { error: 'No planet with uuid ' + params.planetUuid + ' was found.' }

    if (planetData.owner != params.playerUuid) 
      return { error: 'Cant build in a planet not owned' }
  
    const planet : Planet = new Planet(planetData);
    planet.buildStructure(params.structureType);
  });

  ws_response_getPlanetData(socket, (params) => {
    const planetData : PlanetData | undefined = planets.getByKey(params.planetUuid);
    if (planetData) {
      return {planetData: planetData};
    } else {
      throw Error('No planet with uuid ' + params.planetUuid + ' was found.');
    }
  });

  ws_response_getPlayerData(socket, (params) => {
    const playerData : PlayerData = users[params.playerUuid];
    return {player: playerData};
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
}
