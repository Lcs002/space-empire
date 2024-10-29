import { Socket } from "socket.io";
import { socketServer } from "../server";
import { PlanetData, Notification } from "shared";

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

    notifyObservers(notification : Notification<T>) {
        if (!this.events.has(notification.event)) return;

        this.events.get(notification.event)?.forEach((playerUuid) => {
            notification.send(socketServer, playerUuid);
        });
    }
}