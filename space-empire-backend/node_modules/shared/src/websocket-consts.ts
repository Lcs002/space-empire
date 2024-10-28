import { Socket } from 'socket.io';
import { PlanetData } from './planet';
import { StructureType } from './structure';
import { PlayerData } from './player';
import { Point } from './point';

export enum WebSocketCalls {
    GetPlayerData = "getPlayerData",
    GetNearbyPlanets = "requestNearbyPlanets",
    GetPlanetData = "getPlanetData",
    ConquerPlanet = "conquerPlanet",
    ErrorPlanetAlreadyOwned = "errorPlanetAlreadyOwned",
    BuildStructure = "buildStructure",
    ViewPlanet = "viewPlanet"
}

// Base class for WebSocket actions
class WebSocketAction {
    static request<TParams, TResponse extends Object>(
        socket: any, 
        callType: WebSocketCalls, 
        params: TParams
    ): Promise<TResponse> {
        return new Promise((resolve, reject) => {
            socket.emit(callType, params, (response: TResponse | { error: string }) => {
                if ('error' in response) {
                    reject(new Error(response.error));
                } else {
                    resolve(response);
                }
            });
        });
    }

    static response<TParams, TResponse>(
        socket: any,
        callType: WebSocketCalls,
        callback: (params: TParams) => TResponse | { error: string }
    ) {
        socket.on(callType, (params: TParams, ackCallback: (response: TResponse | { error: string }) => void) => {
            try {
                const response = callback(params);
                ackCallback(response);
            } catch (error) {
                ackCallback({ error: error.message });
            }
        });
    }
}

// ConquerPlanet Action
export class ConquerPlanetAction {
    static request(socket: any, params: ConquerPlanetParams): Promise<ConqueredPlanetParams> {
        return WebSocketAction.request(socket, WebSocketCalls.ConquerPlanet, params);
    }

    static response(socket:any, callback: (params: ConquerPlanetParams) => ConqueredPlanetParams | { error: string }) {
        WebSocketAction.response(socket, WebSocketCalls.ConquerPlanet, callback);
    }
}

// GetNearbyView Action
export class GetNearbyViewAction {
    static request(socket: any, params: GetNearbyViewParams): Promise<SenNearbyViewParams> {
        return WebSocketAction.request(socket, WebSocketCalls.GetNearbyPlanets, params);
    }

    static response(socket: any, callback: (params: GetNearbyViewParams) => SenNearbyViewParams | { error: string }) {
        WebSocketAction.response(socket, WebSocketCalls.GetNearbyPlanets, callback);
    }
}

// GetPlanetData Action
export class GetPlanetDataAction {
    static request(socket: any, params: GetPlanetDataParams): Promise<SenPlanetDataParams> {
        return WebSocketAction.request(socket, WebSocketCalls.GetPlanetData, params);
    }

    static response(socket: any, callback: (params: GetPlanetDataParams) => SenPlanetDataParams | { error: string }) {
        WebSocketAction.response(socket, WebSocketCalls.GetPlanetData, callback);
    }
}

// GetPlayerData Action
export class GetPlayerDataAction {
    static request(socket: any, params: GetPlayerDataParams): Promise<SenPlayerDataParams> {
        return WebSocketAction.request(socket, WebSocketCalls.GetPlayerData, params);
    }

    static response(socket: any, callback: (params: GetPlayerDataParams) => SenPlayerDataParams | { error: string }) {
        WebSocketAction.response(socket, WebSocketCalls.GetPlayerData, callback);
    }
}

// BuildStructure Action
export class BuildStructureAction {
    static request(socket: any, params: BuildStructureParams): Promise<Object> {
        return WebSocketAction.request(socket, WebSocketCalls.BuildStructure, params);
    }

    static response(socket: any, callback: (params: BuildStructureParams) => Object | { error: string }) {
        WebSocketAction.response(socket, WebSocketCalls.BuildStructure, callback);
    }
}

// Interfaces for Parameters and Responses
export interface ConquerPlanetParams {
    planetUuid: any,
    username: string
}
export interface ConqueredPlanetParams {
    planetUuid: any
}

export interface GetNearbyViewParams {
    username: any;
    position: Point;
    radius: number;
}
export interface SenNearbyViewParams {
    planets: Array<PlanetData>;
}

export interface GetPlanetDataParams {
    planetUuid: any
}
export interface SenPlanetDataParams {
    planetData: PlanetData
}

export interface GetPlayerDataParams {
    playerUuid: any
}
export interface SenPlayerDataParams {
    player: PlayerData;
}

export interface BuildStructureParams {
    planetUuid: any,
    playerUuid: any,
    structureType: StructureType
}
