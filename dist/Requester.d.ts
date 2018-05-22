/// <reference types="node" />
import http from 'http';
import ResponseHandler from './ResponseHandler';
export default class Requester {
    protected readonly responseHandler: ResponseHandler;
    protected ended: boolean;
    constructor(responseHandler: ResponseHandler);
    protected parseURL(url: string): {
        secure: boolean;
        host: string;
        port: number;
        path: string;
    };
    request({url, method, headers, body, timeout}: {
        url: string;
        method: string;
        headers: {
            [key: string]: string | string[];
        };
        body?: Buffer;
        timeout: number;
    }): void;
    handleResponse(response: {
        statusCode: number;
        statusMessage: string;
        headers: http.IncomingHttpHeaders;
    }): void;
    handleData(data: Buffer): void;
    handleEnd(): void;
    handleError(error: Error): void;
    protected end(fn: () => void): void;
}
