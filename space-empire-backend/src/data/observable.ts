import { Socket } from "socket.io";
import { socketServer } from "../server";
import { PlanetData } from "shared";

export abstract class Observable<T> {
    private events : Map<string, Set<string>>;

    constructor() {
        this.events = new Map<string, Set<string>>;
    }

    addObserver(event : string, playerUuid : string) {
        if (!this.events.has(event)) 
            this.events.set(event, new Set<string>());
        else if (!this.events.get(event)?.has(playerUuid))
            this.events.get(event)?.add(playerUuid);
    }

    deleteObserver(event : string, playerUuid : string) {
        if (this.events.has(event) && this.events.get(event)?.has(playerUuid)) 
            this.events.get(event)?.delete(playerUuid);
    }

    notifyObservers(event : string, data : T) {
        if (!this.events.has(event)) return;

        this.events.get(event)?.forEach((playerUuid) => {
            socketServer.to(playerUuid).emit(event, data);
        });
    }
}

/*
class Notification<T> {
    event : string;
    data : T;

    constructor(event : string, data : T) {
        this.event = event;
        this.data = data;
    }

    send(playerUuid : string) {
        Notification.send(playerUuid, this.event, this.data);
    }

    static send<T>(playerUuid : string, event : string, data : T) {
        socketServer.to(playerUuid).emit(event, data);
    }
}

export class PlanetBuildNotification extends Notification<PlanetData> {
    static event = 'planetBuildNotification';

    constructor(data : PlanetData) {
        super('planetBuildNotification', data);
    }

    static send() {
        super.send()
    }
}
*/