export abstract class Observable {
    private observers : Set<string>;

    constructor() {
        this.observers = new Set<string>();
    }

    addObserver(playerUuid : string) {
        if (this.observers.has(playerUuid)) return;
        this.observers.add(playerUuid);
    }

    deleteObserver(playerUuid : string) {
        if (!this.observers.has(playerUuid)) return;
        this.observers.delete(playerUuid);
    }

    notifyObservers() {
        
    }
}