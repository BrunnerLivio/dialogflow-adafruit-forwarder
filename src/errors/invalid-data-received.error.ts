export class InvalidDataReceived extends Error {
    public status: number;
    constructor() {
        super('Received invalid data');
        this.status = 422;
    }
}
