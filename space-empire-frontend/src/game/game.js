import { Application, Container, Graphics, Point } from "pixi.js";
import Color from 'color';
import { Button } from "@pixi/ui";
import { io } from "socket.io-client";
import { Player, Planet } from 'shared';

// Constants
const STP = 0.8;
const CAMERA_SPEED = 5;
const VIEW_RANGE = 800 * 1.5 / STP;
const MIN_ZOOM = 0.5; // Minimum zoom level
const MAX_ZOOM = 8; // Maximum zoom level

// Retrieve JWT token and username
const token = localStorage.getItem('token');
const username = localStorage.getItem('username');

// Verify user authentication
if (!token) {
    alert('You must be logged in to play the game.');
    window.location.href = '../auth/login.html'; // Redirect to login page
}

// Set up the WebSocket connection
const socket = io('http://localhost:5000', {
    query: { token } // Send JWT token with WebSocket connection
});

// Game State
let cameraZoom = 4;
let cameraPosition = { x: 0, y: 0 }; // Initial camera position
let renderedPlanets = new Map() // To track which planets are currently rendered

const pixiContainer = document.getElementById("pixi-container");
const playerName = document.getElementById("username");
playerName.textContent = username;
let highlightedPlanet = null;

// Initialize PIXI application
const app = new Application();
await app.init({ width: pixiContainer.clientWidth, height: pixiContainer.clientHeight, backgroundColor: 0x040404 });
const gameContainer = new Container();
gameContainer.scale = new Point(cameraZoom, cameraZoom);
app.stage.addChild(gameContainer);

// Initialize the game
(async () => {
    pixiContainer.appendChild(app.canvas);
    window.onresize = () => app.renderer.resize(pixiContainer.clientWidth, pixiContainer.clientHeight);
    
    setupSocketListeners();
    setupMouseControls();

    socket.emit('requestNearbyPlanets', username);
})();

// Function to request planets within a certain radius from (x, y)
function requestPlanetsInRange(x, y, radius) {
    socket.emit('searchPlanets', { x, y, radius });
}

// Function to handle WebSocket authentication error
socket.on('connect_error', (err) => {
    console.error('Authentication error:', err.message);
    alert('Session expired or invalid token. Please log in again.');
    window.location.href = '../auth/login.html'; // Redirect to login page
});

// Setup socket event listeners
function setupSocketListeners() {
    socket.on('foundPlanets', (planets) => {
        planets.forEach(renderPlanet);
    });

    socket.on('planetConquered', (uuid) => {
        const renderedPlanet = renderedPlanets.get(uuid);
        renderedPlanet.data.owner = username;
        if (renderedPlanet) {
            highlightOwnedPlanet(renderedPlanet.container, renderedPlanet.data);
            updateOwnedPlanetsList(renderedPlanet.data);
        }
        socket.emit('requestNearbyPlanets', username);
    });

    socket.on('planetDataUpdated', (planet) => {
        const renderedPlanet = renderedPlanets.get(planet.uuid);
        if (renderedPlanet) {
            renderedPlanet.data = planet;
        }
    });

    socket.on('foundNearbyPlanets', (planets) => {
        planets.forEach(renderPlanet);
    });
}

// Function to render a planet
function renderPlanet(planet) {
    if (renderedPlanets.has(planet.uuid)) return; // Skip already rendered planets

    const planetContainer = new Container();
    const color = getColorByResources(planet.resources);

    // Draw atmosphere and planet surface
    drawPlanetGraphics(planetContainer, planet, color);
    
    // Highlight owned planets
    if (planet.owner === username) {
        updateOwnedPlanetsList(planet);
        highlightOwnedPlanet(planetContainer, planet);
    } else if (planet.owner) {
        highlightOtherPlayerPlanet(planetContainer, planet); 
    }

    // Track rendered planet and add to the game container
    renderedPlanets.set(planet.uuid, { container: planetContainer, data: planet });
    gameContainer.addChild(planetContainer);
    
    planetContainer.interactive = true;
    planetContainer.buttonMode = true;
    planetContainer.on('click', () => {
        highlightPlanet(renderedPlanets.get(planet.uuid).container, renderedPlanets.get(planet.uuid).data);
        displayPlanetResources(renderedPlanets.get(planet.uuid).data);
    });
}

// Function to draw planet graphics
function drawPlanetGraphics(container, planet, color) {
    const atmosphere = new Graphics();
    atmosphere.beginFill(color.atmosphereColor);
    atmosphere.drawCircle(planet.position.x * STP, planet.position.y * STP, planet.size.value * 1.25 * STP);
    atmosphere.endFill();
    container.addChild(atmosphere);

    const planetSurface = new Graphics();
    planetSurface.beginFill(color.planetColor);
    planetSurface.drawCircle(planet.position.x * STP, planet.position.y * STP, planet.size.value * STP);
    planetSurface.endFill();
    container.addChild(planetSurface);
}

// Function to highlight owned planets
function highlightOwnedPlanet(container, planet) {
    const highlight = new Graphics();
    highlight.lineStyle(1, 0x00FF00); // Green outline
    highlight.fill(0x000000, 0xFFFFFF);
    highlight.drawCircle(planet.position.x * STP, planet.position.y * STP, planet.size.value * 1.6 * STP);
    highlight.endFill();
    container.addChild(highlight);
}

// Function to highlight planets owned by other players
function highlightOtherPlayerPlanet(container, planet) {
    const highlight = new Graphics();
    highlight.lineStyle(1, 0xFF0000); // Red outline for planets owned by other players
    highlight.fill(0x000000, 0xFFFFFF);
    highlight.drawCircle(planet.position.x * STP, planet.position.y * STP, planet.size.value * 1.6 * STP);
    highlight.endFill();
    container.addChild(highlight);
}

// Function to highlight a planet
function highlightPlanet(container, planet) {
    if (highlightedPlanet) {
        highlightedPlanet.removeChild(highlightedPlanet.highlightCircle);
    }

    const highlightCircle = new Graphics();
    highlightCircle.lineStyle(2, 0xffff00); // Yellow outline
    highlightCircle.fill(0x000000, 0xFFFFFF);
    highlightCircle.drawCircle(planet.position.x * STP, planet.position.y * STP, planet.size.value * 1.85 * STP);
    highlightCircle.endFill();

    container.highlightCircle = highlightCircle;
    container.addChild(highlightCircle);
    highlightedPlanet = container;
}

// Function to display planet resources in the HTML
function displayPlanetResources(planet) {
    const planetDetailsDiv = document.getElementById('planet-details');
    planetDetailsDiv.innerHTML = `
        <P><strong>Owner:</strong> ${planet.owner}</p>
        <p><strong>Size:</strong> ${planet.size.name}</p>
        <p><strong>Bio:</strong> ${planet.resources.bio}</p>
        <p><strong>Minerals:</strong> ${planet.resources.minerals}</p>
        <p><strong>Gas:</strong> ${planet.resources.gas}</p>
        <button onclick="conquerPlanet('${planet.uuid}')">Conquer Planet</button>
    `;
}

// Function to conquer a planet
function conquerPlanet(planetUuid) {
    socket.emit('conquerPlanet', { planetUuid, username });
}

// Function to get color based on resources
function getColorByResources(resources) {
    const { bio, gas, minerals } = resources;

    const bioColor = Color({ h: 120, s: bio / 9 * 100, l: 40 }).rgb().array(); // Green for bio
    const gasColor = Color({ h: 240, s: gas / 9 * 100, l: 40 }).rgb().array(); // Blue for gas
    const mineralColor = Color({ h: 0, s: minerals / 9 * 100, l: 40 }).rgb().array(); // Red for minerals
    const min = (mineralColor[0] << 16) | (mineralColor[1] << 8) | mineralColor[2]
    return {
        planetColor: (bioColor[0] << 16) | (bioColor[1] << 8) | bioColor[2] | min,
        atmosphereColor: (gasColor[0] << 16) | (gasColor[1] << 8) | gasColor[2] | min,
    };
}

// Handle mouse dragging for camera movement
function setupMouseControls() {
    let isDragging = false;
    let lastMousePosition = { x: 0, y: 0 };

    app.canvas.addEventListener('mousedown', (event) => {
        if (event.button === 0) { // Left mouse button
            isDragging = true;
            lastMousePosition = { x: event.clientX, y: event.clientY };
        }
    });

    app.canvas.addEventListener('mouseup', () => {
        isDragging = false;
    });

    app.canvas.addEventListener('mousemove', (event) => {
        if (isDragging) {
            const deltaX = (event.clientX - lastMousePosition.x);
            const deltaY = (event.clientY - lastMousePosition.y);

            // Update camera position
            cameraPosition.x -= deltaX;
            cameraPosition.y -= deltaY;

            // Move all planets relative to the new camera position
            gameContainer.x += deltaX;
            gameContainer.y += deltaY;

            // Request planets for the new visible area
            socket.emit('requestNearbyPlanets', username);
            lastMousePosition = { x: event.clientX, y: event.clientY };
        }
    });

    // Mouse wheel to zoom in/out
    app.canvas.addEventListener('wheel', (event) => {
        event.preventDefault();
    
        const zoomFactor = 0.1; // Adjust zoom factor for smooth zooming
    
        // Calculate new zoom level based on wheel scroll direction
        if (event.deltaY < 0) {
            adjustZoom(cameraZoom + zoomFactor);
        } else {
            adjustZoom(cameraZoom - zoomFactor);
        }
    });

    // Keyboard shortcut for zooming ("Ctrl" + "+" and "Ctrl" + "-")
    document.addEventListener('keydown', (event) => {
        if (event.key === '+') {
            // Ctrl + "+" for zoom in
            adjustZoom(cameraZoom + 0.1);
        }
        
        if (event.key === '-') {
            // Ctrl + "-" for zoom out
            adjustZoom(cameraZoom - 0.1);
        }
    });

    // Function to adjust zoom level and keep game centered
    function adjustZoom(newZoom) {
        // Clamp the zoom value between MIN_ZOOM and MAX_ZOOM
        newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));

        // Calculate the center of the screen in world coordinates before zooming
        const worldCenterBeforeZoom = {
            x: (app.screen.width / 2 - gameContainer.x) / cameraZoom,
            y: (app.screen.height / 2 - gameContainer.y) / cameraZoom
        };

        // Apply the new zoom level
        cameraZoom = newZoom;
        gameContainer.scale.set(cameraZoom, cameraZoom);

        // Calculate the new position to ensure the previous center remains the same
        gameContainer.x = app.screen.width / 2 - worldCenterBeforeZoom.x * cameraZoom;
        gameContainer.y = app.screen.height / 2 - worldCenterBeforeZoom.y * cameraZoom;
    }
}

function updateOwnedPlanetsList(planet) {
    // Create a list item for the planet
    const planetList = document.getElementById('planet-list');
    const listItem = document.createElement('li');
    listItem.textContent = planet.uuid;
    listItem.style.cursor = 'pointer';
    
    // Add click event to move the camera to the planet
    listItem.onclick = () => moveCameraToPlanet(planet);
    
    // Append the list item to the list
    planetList.appendChild(listItem);
}

function moveCameraToPlanet(planet) {
    const planetX = planet.position.x * STP;
    const planetY = planet.position.y * STP;
    console.log(planet.position);

    // Optionally, highlight the planet
    highlightPlanet(renderedPlanets.get(planet.uuid).container, planet);

    // Apply the new position to the game container
    gameContainer.x = (app.screen.width / 2) - planetX * cameraZoom;
    gameContainer.y = (app.screen.height / 2) - planetY * cameraZoom;
}

// Make conquerPlanet globally accessible
window.conquerPlanet = conquerPlanet;
