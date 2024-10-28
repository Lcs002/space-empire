import QuadT from 'js-quadtree';
import { PlanetData, PlanetSizeInfo, PlanetSizeInfos, PlanetSizeType, ResourcesData } from '../../shared';
import { createNoise2D } from 'simplex-noise';
import { v4 } from 'uuid';
import { IndexedMap } from './util/IndexedMap';
import { Planet } from './data/planet-behavior';

const bioResourceNoise = createNoise2D();
const mineralResourceNoise = createNoise2D();
const gasResourceNoise = createNoise2D();
const planetCountNoise = createNoise2D();
const planetSizeNoise = createNoise2D();

const bioResourceNoiseRes = 1024;
const mineralResourceNoiseRes = 512;
const gasResourceNoiseRes = 512;
const planetCountNoiseRes = 512;
const planetSizeNoiseRes = 1024;

const zones = [
    { name: "High Density", density: 0.6, planetCount: 3 },   // Lots of small planets
    { name: "Medium Density", density: 0.4, planetCount: 2 }, // Fewer, larger planets
    { name: "Low Density", density: 0.1, planetCount: 1 },    // Very few, massive planets
];

const zoneSize = 250;

// Function to initialize the galaxy
export function initializeGalaxy(galaxySize : number, planets : IndexedMap<string, Planet>, quadtree : QuadT.QuadTree) {
    for (let x = 0; x < galaxySize; x += zoneSize) {
        for (let y = 0; y < galaxySize; y += zoneSize) {
            const noiseValue = planetCountNoise(x / planetCountNoiseRes, y / planetCountNoiseRes);
            const planetCount = Math.max(1, Math.floor(noiseValue * 5)); 

            for (let i = 0; i < planetCount; i++) {
                const planetData : PlanetData = generatePlanetData(x + (Math.random() * zoneSize), y + (Math.random() * zoneSize));
                const planet : Planet = new Planet(planetData);
                planets.set(planetData.uuid, planet);
                quadtree.insert(new QuadT.Point(planetData.position.x, planetData.position.y, {uuid: planetData.uuid}));
            }
        }
    }
}

function generatePlanetData(x : number, y : number) : PlanetData {
    const size : PlanetSizeType = getPlanetSize(x, y);
    const resources : ResourcesData = getPlanetResources(x, y);
    return new PlanetData(v4(), new QuadT.Point(x, y), size, resources);
}

function getPlanetSize(x : number, y : number) : PlanetSizeType {
    const noise = planetSizeNoise(x / planetSizeNoiseRes, y / planetSizeNoiseRes);
    const normalizedNoise = (noise + 1) / 2;
    const value = normalizedNoise ** 2 * Math.random();
    const enumValues =  Object.values(PlanetSizeType);
    const index = Math.round(value * enumValues.length); 
    return enumValues[(Math.min(index, enumValues.length - 1))];
}

function getPlanetResources(x, y) : ResourcesData {
    const bioNoise = (bioResourceNoise(x / bioResourceNoiseRes, y / bioResourceNoiseRes) + 1) / 2;
    const mineralsNoise = (mineralResourceNoise(x / mineralResourceNoiseRes, y / mineralResourceNoiseRes) + 1) / 2;
    const gasNoise = (gasResourceNoise(x / gasResourceNoiseRes, y / gasResourceNoiseRes) + 1) / 2;
    const bio = bioNoise**2 * Math.random();
    const minerals = mineralsNoise**2 * Math.random();
    const gas = gasNoise**2 * Math.random();
    return new ResourcesData(bio, minerals, gas);
}