enum ResourceTypes {
    BIO = 'Bio',
    MINERAL = 'Mineral',
    GAS = 'Gas'
}

class Resources {
    bio: number;
    mineral: number;
    gas: number;
    constructor(bio : number, mineral : number, gas : number) {
        this.bio = bio;
        this.mineral = mineral;
        this.gas = gas
    }
}

export { Resources, ResourceTypes }