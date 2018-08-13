export class TimeoutError extends Error {
    public status: number;
    constructor() {
        super('Ran into timeout. No message received from server. Try again later');
        this.status = 504;
    }
}
