"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = require("url");
const querystring_1 = __importDefault(require("querystring"));
class Wrapper {
    constructor(requestFn) {
        this.requestFn = requestFn;
    }
    combineURL(url, qs) {
        if (qs !== undefined) {
            const urlObject = new url_1.URL(url);
            if (qs !== undefined) {
                const parameters = urlObject.searchParams;
                for (const key in qs) {
                    parameters.append(key, qs[key]);
                }
                urlObject.search = parameters.toString();
            }
            return urlObject.toString();
        }
        else {
            return url;
        }
    }
    processParams(params) {
        const url = this.combineURL(params.url, params.qs);
        const headers = {};
        if (params.headers !== undefined) {
            for (const key in params.headers) {
                headers[key.toLocaleLowerCase()] = params.headers[key];
            }
        }
        const method = (params.method === undefined) ? 'GET' : params.method;
        let body;
        if (params.json !== undefined) {
            headers['content-type'] = 'application/json';
            body = Buffer.from(JSON.stringify(params.json));
        }
        else if (params.form !== undefined) {
            headers['content-type'] = 'application/x-www-form-urlencoded';
            body = Buffer.from(querystring_1.default.stringify(params.form));
        }
        else if (params.body !== undefined) {
            body = params.body;
        }
        if (body !== undefined && body.length > 0) {
            headers['content-length'] = body.length.toString();
        }
        let gzip;
        if (params.gzip === true || (params.gzip !== false && headers['accept-encoding'] === undefined)) {
            gzip = true;
            headers['accept-encoding'] = 'gzip';
        }
        else {
            gzip = false;
        }
        if (params.keepAlive === false) {
            headers['connection'] = 'close';
        }
        else if (params.keepAlive === true || headers['connection'] === undefined) {
            headers['connection'] = 'keep-alive';
        }
        const followRedirect = (params.followRedirect !== false);
        const timeout = params.timeout === undefined ? 15000 : params.timeout;
        return { url, headers, method, body, gzip, followRedirect, timeout };
    }
    async request(params) {
        let { url, headers, method, body, gzip, followRedirect, timeout } = this.processParams(params);
        let count = 0;
        while (true) {
            const result = await this.requestFn({ url, headers, method, body, gzip, timeout });
            const location = result.headers['location'];
            if (followRedirect && (result.statusCode === 301 || result.statusCode === 302) && method == 'GET' && location !== undefined) {
                if (count < 10) {
                    count++;
                    url = location;
                }
                else {
                    throw new Error('Redirection loop');
                }
            }
            else {
                return result;
            }
        }
    }
}
exports.default = Wrapper;
//# sourceMappingURL=Wrapper.js.map