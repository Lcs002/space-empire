import { io } from "socket.io-client";
import { PlanetData, Point, SERVER_ROUTE, StructureType, ws_request_buildStructure, ws_request_conquerPlanet, ws_request_getNearbyView, ws_request_getPlanetData, ws_request_getPlayerData, ws_response_getPlanetData } from "../../../shared";
import { GameUI } from '../internal'

export const renderedPlanets = new Map();
export const token = localStorage.getItem('token');
export const username = localStorage.getItem('username');

if (!token) {
    alert('You must be logged in to play the game.');
    window.location.href = '../auth/login.html';
}

const socket = io(SERVER_ROUTE, {
    query: { token } 
});

socket.on('connect_error', (err) => {
    console.error('Authentication error:', err.message);
    alert('Session expired or invalid token. Please log in again.');
    window.location.href = '../auth/login.html'; 
});

console.log("B")
const gameUI = new GameUI();

(async () => {
    await gameUI.initialize(socket, username); 
    await updatePlayerData();
    await updateNearbyVision();
})();

export async function conquerPlanet(planetUuid : any) {
    try {
        const resp = await ws_request_conquerPlanet(socket, {planetUuid: planetUuid, username: username as string});
        const renderedPlanet = renderedPlanets.get(resp.planetUuid);
        if (renderedPlanet) {
            renderedPlanet.data.owner = username;
            gameUI.highlightOwnedPlanet(renderedPlanet.container, renderedPlanet.data);
            gameUI.updateOwnedPlanetsList(planetUuid);
        }
        selectPlanet(planetUuid);
        updateNearbyVision();
    } catch(error) {
        alert(error)
    }
}

export async function buildStructure(plannetUuid : any, structureType : StructureType) {
    try {
        ws_request_buildStructure(socket, {planetUuid: plannetUuid, playerUuid: username, structureType: structureType});
        selectPlanet(plannetUuid);
    } catch(error) {
        alert(error)
    }
}

export async function selectPlanet(planetUuid : any) {
    const planetData : PlanetData = await getPlanetData(planetUuid);
    gameUI.highlightPlanet(renderedPlanets.get(planetUuid).container, renderedPlanets.get(planetUuid).data);
    gameUI.displayPlanetInfo(planetData)
}

export async function getPlanetData(planetUuid : any) : Promise<PlanetData> {
    let planetData : PlanetData | null = null;

    try {
        const respPlanet = await ws_request_getPlanetData(socket, {planetUuid: planetUuid});
        planetData = respPlanet.planetData;
    } catch(error) {
        console.log(error);
    }

    if (planetData === null) throw Error("Planet uuid not found");
    return planetData;
}

async function updatePlayerData() {
    try {
        const respPlayer = await ws_request_getPlayerData(socket, {playerUuid: username});
        gameUI.updatePlayerDataUI(respPlayer.player);
    } catch(error) {
        console.log(error);
    }
}

export async function updateNearbyVision() {
    try {
        const nearbyView = await ws_request_getNearbyView(
            socket, 
            {
                username: username, 
                position: new Point(gameUI.getViewPosition().x, gameUI.getViewPosition().y),
                radius: 2000
            }
        );

        nearbyView.planets.forEach(planet => {
            if (!renderedPlanets.has(planet.uuid)) {
                gameUI.renderPlanet(planet);
            } else {
                renderedPlanets.get(planet.uuid).data = planet;
            }
        });
    } catch (error) {
        console.log(error);
    }
}