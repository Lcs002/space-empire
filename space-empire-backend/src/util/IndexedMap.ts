export class IndexedMap<T, K> {
    dataMap: Map<T, K>;
    indexMap: Map<number, T>;
    keyMap: Map<T, number>;
    freeIndexQueue: Array<number>;

    constructor() {
        this.dataMap = new Map<T, K>();
        this.indexMap = new Map<number, T>();
        this.keyMap = new Map<T, number>();
        this.freeIndexQueue = new Array<number>();
    }

    set(key: T, value: K) {
        const index = this.getFreeIndex();
        this.dataMap.set(key, value);
        this.indexMap.set(index, key);
        this.keyMap.set(key, index);
    }

    remove(key: T) {
        this.dataMap.delete(key);
        const index: number | undefined = this.keyMap.get(key);
        if (index !== undefined) {
            this.indexMap.delete(index);
            this.freeIndexQueue.push(index);
        }
        this.keyMap.delete(key);
    }

    getByIndex(index: number): K {
        const key: T | undefined = this.indexMap.get(index);
        if (key === undefined) {
            throw new Error('No key found for the given index');
        } else {
            let v = this.dataMap.get(key);
            if (v === undefined) throw new Error('No key found for the given index');
            else return v;
        }
    }

    getByKey(key: T): K | undefined {
        return this.dataMap.get(key);
    }

    getRandom(): K | null {
        if (this.dataMap.size == 0) return null;
        const randomIndex = Math.floor(Math.random() * (this.dataMap.size));
        const randomValueU : K | undefined = this.getByIndex(randomIndex);
        if (randomValueU === undefined) return null;
        const randomValue : K = randomValueU;
        return randomValue;
    }

    getFreeIndex(): number {
        let index: number = this.dataMap.size;
        if (this.freeIndexQueue.length > 0) {
            const i = this.freeIndexQueue.pop();
            if (i !== undefined) index = i;
        }
        return index;
    }

    // New Methods
    size(): number {
        return this.dataMap.size;
    }

    clear(): void {
        this.dataMap.clear();
        this.indexMap.clear();
        this.keyMap.clear();
        this.freeIndexQueue = new Array<number>();
    }

    hasKey(key: T): boolean {
        return this.dataMap.has(key);
    }

    hasIndex(index: number): boolean {
        return this.indexMap.has(index);
    }

    keys(): T[] {
        return Array.from(this.dataMap.keys());
    }

    values(): K[] {
        return Array.from(this.dataMap.values());
    }

    entries(): [T, K][] {
        return Array.from(this.dataMap.entries());
    }

    forEach(callback: (value: K, key: T, map: this) => void): void {
        this.dataMap.forEach((value, key) => {
            callback(value, key, this);
        });
    }
}
