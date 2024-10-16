import QuadT from 'js-quadtree';
import { Server, Socket } from 'socket.io';
import { Planet, Player } from 'shared';
import { initializeGalaxy } from './galaxyGen';
import { users } from './server';
import { IndexedMap } from './util/IndexedMap';

const galaxySize = 100000;
const quadtreeBoundary = new QuadT.Box(0, 0, galaxySize, galaxySize);

// Initialize quadtree and planets map
export const planets: IndexedMap<string, Planet> = new IndexedMap();
export const quadtree: QuadT.QuadTree = new QuadT.QuadTree(
    quadtreeBoundary,
    {
        capacity: 10,
        removeEmptyNodes: true,
        maximumDepth: -1
    }
);

// Function to initialize the game state (galaxy)
export function initializeGame() {
  initializeGalaxy(galaxySize, planets, quadtree);
}

// Function to handle new WebSocket connections
export function handleConnection(socket: Socket) {
  console.log('A user connected');

  socket.on('searchPlanets', ({ x, y, radius }) => searchPlanets(socket, { x, y, radius }));
  socket.on('requestNearbyPlanets', (username: string) => requestNearbyPlanets(socket, username));
  socket.on('conquerPlanet', ({ planetUuid, username }) => conquerPlanet(socket, planetUuid, username));
  socket.on('playerAction', (data) => handlePlayerAction(socket, data));

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
}

// #######################
// Socket Event Handlers
// #######################

// Search for planets within a radius
function searchPlanets(socket: Socket, { x, y, radius }: { x: number; y: number; radius: number }) {
  const results = quadtree.query(new QuadT.Circle(x, y, radius));
  const foundPlanets = results.map(point => planets.getByKey(point.data.uuid));

  // Send the planet data back to the client
  socket.emit('foundPlanets', foundPlanets);
}

// Request nearby planets based on player's owned planets
function requestNearbyPlanets(socket: Socket, username: string) {
  const player : Player = users[username];
  const nearbyPlanets: Planet[] = [];

  player.ownedPlanets.forEach(ownedPlanet => {
    const planet : Planet | undefined = planets.getByKey(ownedPlanet);
    if (planet === undefined) return;
    const results = quadtree.query(new QuadT.Circle(planet.position.x, planet.position.y, 800));
    results.forEach(point => {
      const nearbyPlanet = planets.getByKey(point.data.uuid);
      if (nearbyPlanet && nearbyPlanet.owner !== username) {
        nearbyPlanets.push(nearbyPlanet);
      }
    });
  });
  socket.emit('foundNearbyPlanets', nearbyPlanets);
}

// Handle planet conquering
function conquerPlanet(socket: Socket, planetUuid: string, username: string) {
  const planet = planets.getByKey(planetUuid);
  if (planet) {
    if (planet.owner === null) {
      planet.owner = username; // Assign ownership to the player
      const player : Player = users[username];
      player.ownedPlanets.push(planetUuid);
      socket.emit('planetConquered', planetUuid); // Notify the conquering player
      socket.broadcast.emit('planetDataUpdated', planet); // Notify all other players
    } else {
      socket.emit('error', { message: 'This planet is already owned by another player.' });
    }
  }
}

// Handle player actions (e.g., moving fleets, attacking, etc.)
function handlePlayerAction(socket: Socket, data: any) {
  // Broadcast player actions to other clients
  socket.broadcast.emit('updateGameState', data);
}
