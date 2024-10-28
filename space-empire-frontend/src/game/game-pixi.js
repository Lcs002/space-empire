import { Application, Container, Graphics, Point } from "pixi.js";
import Color from 'color';
import { getStructureData, PlanetData, PlanetSizeInfos, StructureType } from "../../../shared";
import { buildStructure, conquerPlanet, getPlanetData, renderedPlanets, selectPlanet, updateNearbyVision, username } from "../internal";

export class GameUI {
    constructor() {
        this.username = null;
        this.cameraZoom = 1;
        this.MIN_ZOOM = 0.5;
        this.MAX_ZOOM = 8;
        this.STP = 0.8;
        this.gameContainer = null;
        this.selectedPlanet = null;
        this.cameraPosition = new Point(0, 0);
        this.app = null;
        this.init = false;
        this.isDragging = false;
        this.lastMousePosition = { x: 0, y: 0 };
        this.socket = null;
    }

    async initialize(socket, username) {
        if (this.init) return;
        this.init = true;

        this.username = username;
        this.socket = socket;

        const pixiContainer = document.getElementById("pixi-container");
        const playerName = document.getElementById("username");
        playerName.textContent = username;
    
        this.app = new Application();
        await this.app.init({ width: pixiContainer.clientWidth, height: pixiContainer.clientHeight, backgroundColor: 0x040404 });
        this.gameContainer = new Container();
        this.gameContainer.scale = new Point(this.cameraZoom, this.cameraZoom);
        
        console.log("A");
        this.app.stage.addChild(this.gameContainer);
        pixiContainer.appendChild(this.app.canvas);
    
        window.onresize = () => app.renderer.resize(pixiContainer.clientWidth, pixiContainer.clientHeight);
    
        this.setupMouseControls(this.app, socket);
    }

    setupMouseControls(app, socket) {

        this.app.canvas.addEventListener('mousedown', (event) => {
            if (event.button === 0) { // Left mouse button
                this.isDragging = true;
                this.lastMousePosition = { x: event.clientX, y: event.clientY };
            }
        });
    
        this.app.canvas.addEventListener('mouseup', () => this.isDragging = false);
    
        this.app.canvas.addEventListener('mousemove', (event) => {
            if (this.isDragging) {
                const deltaX = (event.clientX - this.lastMousePosition.x);
                const deltaY = (event.clientY - this.lastMousePosition.y);
    
                this.cameraPosition.x -= deltaX / this.cameraZoom; 
                this.cameraPosition.y -= deltaY / this.cameraZoom;
    
                this.gameContainer.x += deltaX;
                this.gameContainer.y += deltaY;
    
                updateNearbyVision();
    
                this.lastMousePosition = { x: event.clientX, y: event.clientY };
            }
        });
    
        this.app.canvas.addEventListener('wheel', (event) => {
            event.preventDefault();
            const zoomFactor = 0.1;
            if (event.deltaY < 0) this.adjustZoom(this.cameraZoom + this.zoomFactor);
            else this.adjustZoom(this.cameraZoom - this.zoomFactor);
        });
    
        document.addEventListener('keydown', (event) => {
            if (event.key === '+') this.adjustZoom(this.cameraZoom + 0.1);
            if (event.key === '-') this.adjustZoom(this.cameraZoom - 0.1);
        });
    }

    adjustZoom(newZoom) {
        // Clamp the zoom value between MIN_ZOOM and MAX_ZOOM
        newZoom = Math.max(this.MIN_ZOOM, Math.min(this.MAX_ZOOM, newZoom));

        // Calculate the center of the screen in world coordinates before zooming
        const worldCenterBeforeZoom = {
            x: (this.app.screen.width / 2 - this.gameContainer.x) / this.cameraZoom,
            y: (this.app.screen.height / 2 - this.gameContainer.y) / this.cameraZoom
        };

        // Apply the new zoom level
        this.cameraZoom = newZoom;
        this.gameContainer.scale.set(this.cameraZoom, this.cameraZoom);

        // Calculate the new position to ensure the previous center remains the same
        this.gameContainer.x = this.app.screen.width / 2 - worldCenterBeforeZoom.x * this.cameraZoom;
        this.gameContainer.y = this.app.screen.height / 2 - worldCenterBeforeZoom.y * this.cameraZoom;
    }

    renderPlanet(planet) {
        planet = Object.assign(new PlanetData(), planet);
    
        const planetContainer = new Container();
        const color = this.getColorByResources(planet.resources);
        this.drawPlanetGraphics(planetContainer, planet, color);
    
        if (planet.owner === this.username) {
            this.highlightOwnedPlanet(planetContainer, planet);
        } else if (planet.owner) {
            this.highlightOtherPlayerPlanet(planetContainer, planet); 
        }
    
        renderedPlanets.set(planet.uuid, { container: planetContainer, data: planet });
        this.gameContainer.addChild(planetContainer);
        
        planetContainer.interactive = true;
        planetContainer.buttonMode = true;
        planetContainer.on('click', () => { selectPlanet(planet.uuid); });
    }

    drawPlanetGraphics(container, planet, color) {
        planet = Object.assign(new PlanetData(), planet);

        const atmosphere = new Graphics();
        atmosphere.beginFill(color.atmosphereColor);
        atmosphere.drawCircle(planet.position.x * this.STP, planet.position.y * this.STP, planet.getSizeValue() * 1.25 * this.STP);
        atmosphere.endFill();
        container.addChild(atmosphere);
    
        const planetSurface = new Graphics();
        planetSurface.beginFill(color.planetColor);
        planetSurface.drawCircle(planet.position.x * this.STP, planet.position.y * this.STP, planet.getSizeValue() * this.STP);
        planetSurface.endFill();
        container.addChild(planetSurface);
    }

    highlightOwnedPlanet(container, planet) {
        planet = Object.assign(new PlanetData(), planet);

        const highlight = new Graphics();
        highlight.lineStyle(1, 0x00FF00); // Green outline
        highlight.fill(0x000000, 0xFFFFFF);
        highlight.drawCircle(planet.position.x * this.STP, planet.position.y * this.STP, planet.getSizeValue() * 1.8 * this.STP);
        highlight.endFill();
        container.addChild(highlight);
    }

    highlightOtherPlayerPlanet(container, planet) {
        planet = Object.assign(new PlanetData(), planet);

        const highlight = new Graphics();
        highlight.lineStyle(1, 0xFF0000); // Red outline for planets owned by other players
        highlight.fill(0x000000, 0xFFFFFF);
        highlight.drawCircle(planet.position.x * this.STP, planet.position.y * this.STP, planet.getSizeValue() * 1.8 * this.STP);
        highlight.endFill();
        container.addChild(highlight);
    }

    highlightPlanet(container, planet) {
        planet = Object.assign(new PlanetData(), planet);

        if (this.selectedPlanet) {
            this.selectedPlanet.removeChild(this.selectedPlanet.highlightCircle);
        }
    
        this.selectedPlanet = container;
    
        const highlightCircle = new Graphics();
        highlightCircle.lineStyle(1, 0xffff00); // Yellow outline
        highlightCircle.fill(0x000000, 0xFFFFFF);
        highlightCircle.drawCircle(planet.position.x * this.STP, planet.position.y * this.STP, planet.getSizeValue() * 2.2 * this.STP);
        highlightCircle.endFill();
        this.selectedPlanet.addChild(highlightCircle);
        this.selectedPlanet.highlightCircle = highlightCircle; // Keep reference for removal
    }

    displayPlanetInfo(planet) {
        planet = Object.assign(new PlanetData(), planet);

        const planetDetailsDiv = document.getElementById('planet-details');
        planetDetailsDiv.innerHTML = `
            <P><strong>Owner:</strong> ${planet.owner}</p>
            <p><strong>Size:</strong> ${planet.size}</p>
            <p><strong>Bio:</strong> ${planet.resources.bio.toFixed(2)*100}%<strong> | Minerals:</strong> ${planet.resources.mineral.toFixed(2)*100}%<strong> | Gas:</strong> ${planet.resources.gas.toFixed(2)*100}%</p>
            <p><strong>Bio:</strong> ${planet.availableResources.bio.toFixed(2)}<strong> | Minerals:</strong> ${planet.availableResources.mineral.toFixed(2)}<strong> | Gas:</strong> ${planet.availableResources.gas.toFixed(2)}</p>
            <button id="conquer-button">Conquer Planet</button>
        `;

        if (planet.structures && planet.structures.length > 0) {
            const structuresList = document.createElement('div');
            structuresList.innerHTML = '<strong>Built Structures:</strong>';
            const ul = document.createElement('ul');
    
            planet.structures.forEach((structure) => {
                const li = document.createElement('li');
                li.textContent = structure.type;
                li.onclick = () => this.displayStructureDetails(structure);
                ul.appendChild(li);
            });
    
            structuresList.appendChild(ul);
            planetDetailsDiv.appendChild(structuresList);
        } else {
            const noStructuresMessage = document.createElement('p');
            noStructuresMessage.textContent = 'No structures built on this planet.';
            planetDetailsDiv.appendChild(noStructuresMessage);
        }

        if (planet.owner === this.username) {
            const availableStructuresDiv = document.createElement('div');
            availableStructuresDiv.innerHTML = '<strong>Available Structures to Build:</strong>';
            
            Object.values(StructureType).forEach((structureType) => {
                const structureData = getStructureData(structureType);
                
                const structureDiv = document.createElement('div');
                structureDiv.innerHTML = `
                    <p style="font-size: 14px">${structureData.type}</p>
                    <p style="font-size: 10px"><strong>Cost:</strong> Bio: ${structureData.cost.bio}, Minerals: ${structureData.cost.mineral}, Gas: ${structureData.cost.gas}</p>
                    <p style="font-size: 10px"><strong>Size:</strong> ${structureData.size}</p>
                    <p style="font-size: 10px"><strong>Description:</strong></p>
                `;
                
                const buildButton = document.createElement('button');
                buildButton.textContent = 'Build';
                buildButton.addEventListener('click', () => buildStructure(planet.uuid, structureType));
        
                structureDiv.appendChild(buildButton);
                availableStructuresDiv.appendChild(structureDiv);
            });
            
            planetDetailsDiv.appendChild(availableStructuresDiv);
        }

        document.getElementById("conquer-button").onclick = () => conquerPlanet(planet.uuid);
    }

    displayStructureDetails(structure) {
        const structureDetailsDiv = document.getElementById('planet-details');
    
        structureDetailsDiv.innerHTML += `
            <hr>
            <h4>Structure Details:</h4>
            <p><strong>Type:</strong> ${structure.type}</p>
            <p><strong>Cost:</strong></p>
            <ul>
                <li>Bio: ${structure.cost.bio}</li>
                <li>Minerals: ${structure.cost.mineral}</li>
                <li>Gas: ${structure.cost.gas}</li>
            </ul>
            <p><strong>Size:</strong> ${structure.size}</p>
        `;
    }

    updatePlayerDataUI(player) {
        const planetList = document.getElementById('planet-list');
        planetList.innerHTML = '';
    
        player.ownedPlanets.forEach(planetUuid => {
            const listItem = document.createElement('li');
            listItem.textContent = planetUuid;
            listItem.style.cursor = 'pointer';
            
            listItem.onclick = () => this.moveCameraToPlanet(planetUuid);
            
            planetList.appendChild(listItem);
        });
    }

    updateOwnedPlanetsList(planetUuid) {
        const planetList = document.getElementById('planet-list');
        const listItem = document.createElement('li');
        listItem.textContent = planetUuid;
        listItem.style.cursor = 'pointer';
        
        listItem.onclick = () => this.moveCameraToPlanet(planetUuid);
        
        planetList.appendChild(listItem);
    }

    async moveCameraToPlanet(planetUuid) {
        const planet = await getPlanetData(planetUuid);
        const planetX = planet.position.x * this.STP;
        const planetY = planet.position.y * this.STP;
    
        // highlightPlanet(renderedPlanets.get(planet.uuid).container, planet);
    
        this.gameContainer.x = (this.app.screen.width / 2) - planetX * this.cameraZoom;
        this.gameContainer.y = (this.app.screen.height / 2) - planetY * this.cameraZoom;
    
        selectPlanet(planetUuid);
        updateNearbyVision();
    }

    getColorByResources(resources) {
        const { bio, gas, minerals } = resources;
    
        const bioColor = Color({ h: 120, s: bio * 100, l: 40 }).rgb().array(); // Green for bio
        const gasColor = Color({ h: 240, s: gas * 100, l: 40 }).rgb().array(); // Blue for gas
        const mineralColor = Color({ h: 0, s: minerals * 100, l: 40 }).rgb().array(); // Red for minerals
        const min = (mineralColor[0] << 16) | (mineralColor[1] << 8) | mineralColor[2]
        return {
            planetColor: (bioColor[0] << 16) | (bioColor[1] << 8) | bioColor[2] | min,
            atmosphereColor: (gasColor[0] << 16) | (gasColor[1] << 8) | gasColor[2] | min,
        };
    }

    getViewPosition() {
        // Calculate the center of the screen in screen coordinates
        const screenCenterX = this.app.screen.width / 2;
        const screenCenterY = this.app.screen.height / 2;
    
        const centerXInWorldSpace = -(screenCenterX + this.gameContainer.x) / (this.STP * this.cameraZoom);
        const centerYInWorldSpace = -(screenCenterY + this.gameContainer.y) / (this.STP * this.cameraZoom);

        return { x:centerXInWorldSpace,  y:centerYInWorldSpace };
    }
}
