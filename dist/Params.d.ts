/// <reference types="node" />
export default interface Params {
    url: string;
    qs?: {
        [index: string]: string;
    };
    headers?: {
        [index: string]: string | string[];
    };
    method?: string;
    json?: any;
    form?: {
        [index: string]: string;
    };
    body?: Buffer;
    gzip?: boolean;
    keepAlive?: boolean;
    followRedirect?: boolean;
    timeout?: number;
}
