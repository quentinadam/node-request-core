"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const https_1 = __importDefault(require("https"));
const http_1 = __importDefault(require("http"));
const url_1 = require("url");
const httpsAgent = new https_1.default.Agent({ keepAlive: true });
const httpAgent = new http_1.default.Agent({ keepAlive: true });
class Requester {
    constructor(responseHandler) {
        this.ended = false;
        this.responseHandler = responseHandler;
    }
    parseURL(url) {
        const urlObject = new url_1.URL(url);
        let secure;
        if (urlObject.protocol === 'https:') {
            secure = true;
        }
        else if (urlObject.protocol === 'http:') {
            secure = false;
        }
        else {
            throw new Error(`Unsupported protocol ${urlObject.protocol}`);
        }
        return {
            secure: secure,
            host: urlObject.hostname,
            port: urlObject.port === '' ? (secure ? 443 : 80) : parseInt(urlObject.port),
            path: urlObject.pathname + urlObject.search,
        };
    }
    request({ url, method, headers, body, timeout }) {
        const { secure, host, port, path } = this.parseURL(url);
        const request = secure ? (https_1.default.request({ host, port, path, method, agent: httpsAgent })) : (http_1.default.request({ host, port, path, method, agent: httpAgent }));
        for (const key in headers) {
            request.setHeader(key, headers[key]);
        }
        request.setTimeout(timeout);
        request.on('timeout', () => {
            const error = new Error('socket timed out');
            //error.code = 'ECONNTIMEOUT';
            request.socket.destroy(error);
        });
        request.on('response', (response) => {
            this.handleResponse({
                statusCode: response.statusCode,
                statusMessage: response.statusMessage,
                headers: response.headers
            });
            response.on('data', (data) => {
                this.handleData(data);
            });
            response.on('end', () => {
                this.handleEnd();
            });
        });
        request.on('error', (error) => {
            this.handleError(error);
        });
        request.end(body);
    }
    handleResponse(response) {
        this.responseHandler.handleResponse(response);
    }
    handleData(data) {
        this.responseHandler.handleData(data);
    }
    handleEnd() {
        this.end(() => {
            this.responseHandler.handleEnd();
        });
    }
    handleError(error) {
        this.end(() => {
            this.responseHandler.handleError(error);
        });
    }
    end(fn) {
        if (this.ended === false) {
            this.ended = true;
            fn();
        }
    }
}
exports.default = Requester;
//# sourceMappingURL=Requester.js.map