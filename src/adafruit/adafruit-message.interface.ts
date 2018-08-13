export interface AdafruitMessage {
    requestId: string;
    data: {
        queryText: string;
        parameters: any;
        languageCode: string;
    }
}

export interface IncomingAdafruitMessage {
    requestId: string;
    data: string;
}
