import { Socket } from 'socket.io';
import { initializeGalaxy } from './galaxyGen';


import { SpaceManager } from './manager/space-manager';

import { PlanetManager } from './manager/planet-manager';
import { PlayerManager } from './manager/player-manager';

export namespace Game {

  export function initializeGame() {
    initializeGalaxy(SpaceManager.galaxySize, PlanetManager.planets, SpaceManager.planetQuadTree);
    initializeLoop();
  }

  function initializeLoop() {
    setInterval(() => {
      PlanetManager.extractResources();
    }, 1000);
  }

  export function setupWebSocket(socket: Socket) {
    console.log(`A user connected: ${socket.data.username}`);
    socket.join(socket.data.username);

    SpaceManager.setupWebSocket(socket);
    PlanetManager.setupWebSocket(socket);
    PlayerManager.setupWebSocket(socket);

    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  }
}