/// <reference types="node" />
import Result from './Result';
import Params from './Params';
export default class Wrapper {
    private readonly requestFn;
    constructor(requestFn: (params: {
        url: string;
        method: string;
        headers: {
            [key: string]: string | string[];
        };
        body?: Buffer;
        gzip: boolean;
        timeout: number;
    }) => Promise<Result>);
    private combineURL(url, qs?);
    private processParams(params);
    request(params: Params): Promise<Result>;
}
