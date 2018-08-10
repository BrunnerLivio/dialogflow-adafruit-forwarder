export interface AdafruitMessage {
    requestId: string;
    data: {
        queryText: string;
        parameters: any;
        languageCode: string;
    }
}
