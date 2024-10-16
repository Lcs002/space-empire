import QuadT from 'js-quadtree';
import { Planet, PlanetSizes, Resources } from '../../shared';
import { createNoise2D } from 'simplex-noise';
import { v4 } from 'uuid';
import { IndexedMap } from './util/IndexedMap';

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

const planetSizes = [
    { name: PlanetSizes.TINY, value: 3},
    { name: PlanetSizes.SMALL, value: 4.5},
    { name: PlanetSizes.STANDARD, value: 6},
    { name: PlanetSizes.BIG, value: 7.5},
    { name: PlanetSizes.COLOSSAL, value: 9}

];

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
                const planet : Planet = generatePlanet(x + (Math.random() * zoneSize), y + (Math.random() * zoneSize));
                planets.set(planet.uuid, planet);
                quadtree.insert(new QuadT.Point(planet.position.x, planet.position.y, {uuid: planet.uuid}));
            }
        }
    }
}

function generatePlanet(x : number, y : number) : Planet {
    const size : PlanetSizes = getPlanetSize(x, y);
    const resources : Resources = getPlanetResources(x, y, size);
    return new Planet(v4(), new QuadT.Point(x, y), size, resources);
}

function getPlanetSize(x : number, y : number) : any {
    const noise = planetSizeNoise(x / planetSizeNoiseRes, y / planetSizeNoiseRes);
    const normalizedNoise = (noise + 1) / 2;
    const value = normalizedNoise ** 2 * Math.random();
    const index = Math.round(value * planetSizes.length); 
    return planetSizes[Math.min(index, planetSizes.length - 1)];
}

function getPlanetResources(x, y, size : any) : Resources {
    const bioNoise = (bioResourceNoise(x / bioResourceNoiseRes, y / bioResourceNoiseRes) + 1) / 2;
    const mineralsNoise = (mineralResourceNoise(x / mineralResourceNoiseRes, y / mineralResourceNoiseRes) + 1) / 2;
    const gasNoise = (gasResourceNoise(x / gasResourceNoiseRes, y / gasResourceNoiseRes) + 1) / 2;
    const bio = bioNoise**2 * Math.random() * size.value;
    const minerals = mineralsNoise**2 * Math.random() * size.value;
    const gas = gasNoise**2 * Math.random() * size.value;
    return new Resources(bio, minerals, gas);
}