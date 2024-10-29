import { io } from "socket.io-client";
import { BuildStructureAction, ConquerPlanetAction, GetNearbyViewAction, GetPlanetDataAction, GetPlayerDataAction, NotifyPlanetBuiltStructure, NotifyPlanetExtractedResources, PlanetData, Point, SERVER_ROUTE, StructureType, SubscribePlanetEvent, UnsubscribePlanetEvent, WebSocketEvents } from "../../../shared";
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

const gameUI = new GameUI();

(async () => {
    await gameUI.initialize(socket, username); 
    await setupEventHandlers();
    await updatePlayerData();
    await updateNearbyVision();
})();

async function setupEventHandlers() {
    NotifyPlanetBuiltStructure.on(socket, (params) => {
        if (renderedPlanets.has(params.uuid))
            renderedPlanets.get(params.uuid).data = params;
        if (gameUI.selectedPlanetUuid === params.uuid)
            gameUI.displayPlanetInfo(params);
    });

    NotifyPlanetExtractedResources.on(socket, (params) => {
        if (renderedPlanets.has(params.uuid))
            renderedPlanets.get(params.uuid).data = params;
        if (gameUI.selectedPlanetUuid === params.uuid)
            gameUI.displayPlanetInfo(params);
    });
}

export async function conquerPlanet(planetUuid : any) {
    try {
        const resp = await ConquerPlanetAction.request(socket, {planetUuid: planetUuid, username: username as string});
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
        await BuildStructureAction.request(socket, {planetUuid: plannetUuid, playerUuid: username, structureType: structureType});
    } catch(error) {
        alert(error)
    }
}

export async function selectPlanet(planetUuid : any) {
    if (gameUI.selectedPlanetUuid != null) {
        try {
            UnsubscribePlanetEvent.request(socket, { planetUuid: gameUI.selectedPlanetUuid, event: WebSocketEvents.PlanetBuiltStructure });
            UnsubscribePlanetEvent.request(socket, { planetUuid: gameUI.selectedPlanetUuid, event: WebSocketEvents.PlanetExtractedResources });
        } catch(error) {
            console.log(error);
        }
    }
    
    try {
        SubscribePlanetEvent.request(socket, { planetUuid: planetUuid, event: WebSocketEvents.PlanetBuiltStructure});
        SubscribePlanetEvent.request(socket, { planetUuid: planetUuid, event: WebSocketEvents.PlanetExtractedResources});
    } catch(error) {
        console.log(error);
    }

    const planetData : PlanetData = await getPlanetData(planetUuid);
    gameUI.highlightPlanet(renderedPlanets.get(planetUuid).container, renderedPlanets.get(planetUuid).data);
    gameUI.displayPlanetInfo(planetData)
}

export async function getPlanetData(planetUuid : any) : Promise<PlanetData> {
    let planetData : PlanetData | null = null;

    try {
        const respPlanet = await GetPlanetDataAction.request(socket, {planetUuid: planetUuid});
        planetData = respPlanet.planetData;
    } catch(error) {
        console.log(error);
    }

    if (planetData === null) throw Error("Planet uuid not found");
    return planetData;
}

async function updatePlayerData() {
    try {
        const respPlayer = await GetPlayerDataAction.request(socket, {playerUuid: username});
        gameUI.updatePlayerDataUI(respPlayer.player);
    } catch(error) {
        console.log(error);
    }
}

export async function updateNearbyVision() {
    try {
        const nearbyView = await GetNearbyViewAction.request(
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