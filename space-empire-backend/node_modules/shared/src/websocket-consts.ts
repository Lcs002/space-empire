import { Socket } from 'socket.io';
import { PlanetData } from './planet';
import { StructureType } from "./structure";
import { PlayerData } from './player';
import { Point } from './point';

export enum WebSocketCalls {
    GetPlayerData = "getPlayerData",
    GetNearbyPlanets = "requestNearbyPlanets",
    GetPlanetData = "getPlanetData",
    ConquerPlanet = "conquerPlanet",
    ErrorPlanetAlreadyOwned = "errorPlanetAlreadyOwned",
    BuildStructure = "buildStructure"
}

// Conquer Planet
export interface ConquerPlanetParams {
    planetUuid: any,
    username: string
}
export interface ConqueredPlanetParams {
    planetUuid: any
}
export function ws_request_conquerPlanet(socket: any, params: ConquerPlanetParams): Promise<ConqueredPlanetParams> {
    return new Promise((resolve, reject) => {
        socket.emit(WebSocketCalls.ConquerPlanet, params, (response: ConqueredPlanetParams | { error: string }) => {
            if ('error' in response) {
                reject(new Error(response.error));
            } else {
                resolve(response);
            }
        });
    });
}
export function ws_response_conquerPlanet(socket: any, callback: (params: ConquerPlanetParams) => ConqueredPlanetParams | { error: string }) {
    socket.on(WebSocketCalls.ConquerPlanet, (params: ConquerPlanetParams, ackCallback: (response: ConqueredPlanetParams | { error: string }) => void) => {
        try {
            const response = callback(params);
            ackCallback(response);
        } catch (error) {
            ackCallback({ error: error.message });
        }
    });
}

// Get Nearby Planets
export interface GetNearbyViewParams {
    username: any;
    position: Point;
    radius: number;
}
export interface SenNearbyViewParams {
    planets: Array<PlanetData>;
}
export function ws_request_getNearbyView(socket: any, params: GetNearbyViewParams): Promise<SenNearbyViewParams> {
    return new Promise((resolve, reject) => {
        socket.emit(WebSocketCalls.GetNearbyPlanets, params, (response: SenNearbyViewParams | { error: string }) => {
            if ('error' in response) {
                reject(new Error(response.error));
            } else {
                resolve(response);
            }
        });
    });
}
export function ws_response_getNearbyView(socket: any, callback: (params: GetNearbyViewParams) => SenNearbyViewParams | { error: string }) {
    socket.on(WebSocketCalls.GetNearbyPlanets, (params: GetNearbyViewParams, ackCallback: (response: SenNearbyViewParams | { error: string }) => void) => {
        try {
            const response = callback(params);
            ackCallback(response);
        } catch (error) {
            ackCallback({ error: error.message });
        }
    });
}

// Get Planet Data
export interface GetPlanetDataParams {
    planetUuid: any
}
export interface SenPlanetDataParams {
    planetData: PlanetData
}
export function ws_request_getPlanetData(socket: any, params: GetPlanetDataParams): Promise<SenPlanetDataParams> {
    return new Promise((resolve, reject) => {
        socket.emit(WebSocketCalls.GetPlanetData, params, (response: SenPlanetDataParams | { error: string }) => {
            if ('error' in response) {
                reject(new Error(response.error));
            } else {
                resolve(response);
            }
        });
    });
}
export function ws_response_getPlanetData(socket: any, callback: (params: GetPlanetDataParams) => SenPlanetDataParams | { error: string }) {
    socket.on(WebSocketCalls.GetPlanetData, (params: GetPlanetDataParams, ackCallback: (response: SenPlanetDataParams | { error: string }) => void) => {
        try {
            const response = callback(params);
            ackCallback(response);
        } catch (error) {
            ackCallback({ error: error.message });
        }
    });
}

// Get Player Data
export interface GetPlayerDataParams {
    playerUuid: any
}
export interface SenPlayerDataParams {
    player: PlayerData;
}
export function ws_request_getPlayerData(socket: any, params: GetPlayerDataParams): Promise<SenPlayerDataParams> {
    return new Promise((resolve, reject) => {
        socket.emit(WebSocketCalls.GetPlayerData, params, (response: SenPlayerDataParams | { error: string }) => {
            if ('error' in response) {
                reject(new Error(response.error));
            } else {
                resolve(response);
            }
        });
    });
}
export function ws_response_getPlayerData(socket: any, callback: (params: GetPlayerDataParams) => SenPlayerDataParams | { error: string }) {
    socket.on(WebSocketCalls.GetPlayerData, (params: GetPlayerDataParams, ackCallback: (response: SenPlayerDataParams | { error: string }) => void) => {
        try {
            const response = callback(params);
            ackCallback(response);
        } catch (error) {
            ackCallback({ error: error.message });
        }
    });
}

export interface BuildStructureParams {
    planetUuid: any,
    playerUuid: any,
    structureType: StructureType
}
export function ws_request_buildStructure(socket: any, params: BuildStructureParams): Promise<void> {
    return new Promise((resolve, reject) => {
        socket.emit(WebSocketCalls.BuildStructure, params, (response: void | { error: string }) => {
            if (response) {
                reject(new Error(response.error));
            } else {
                resolve();
            }
        });
    });
}
export function ws_response_buildStructure(socket: any, callback: (params: BuildStructureParams) => void | { error: string }) {
    socket.on(WebSocketCalls.BuildStructure, (params: BuildStructureParams, ackCallback: (response: void | { error: string }) => void) => {
        try {
            const response = callback(params);
            ackCallback(response);
        } catch (error) {
            ackCallback({ error: error.message });
        }
    });
}

