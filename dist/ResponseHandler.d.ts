/// <reference types="node" />
import http from 'http';
import Result from './Result';
export default class ResponseHandler {
    private readonly gzip;
    readonly result: Promise<Result>;
    private accumulator?;
    protected resolve: (result: any) => void;
    protected reject: (error: Error) => void;
    constructor({gzip}: {
        gzip: boolean;
    });
    handleResponse({statusCode, statusMessage, headers}: {
        statusCode: number;
        statusMessage: string;
        headers: http.IncomingHttpHeaders;
    }): void;
    handleData(data: Buffer): void;
    handleEnd(): void;
    handleError(error: Error): void;
}
