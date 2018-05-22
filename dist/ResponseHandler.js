"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const zlib_1 = __importDefault(require("zlib"));
const Body_1 = __importDefault(require("./Body"));
class Accumulator extends events_1.EventEmitter {
    constructor() {
        super();
        this.buffers = [];
    }
    write(data) {
        this.buffers.push(data);
    }
    end() {
        this.emit('end', Buffer.concat(this.buffers));
    }
}
class GzipAccumulator extends Accumulator {
    constructor() {
        super();
        this.decompressor = zlib_1.default.createGunzip();
        this.decompressor.on('data', (buffer) => {
            this.buffers.push(buffer);
        });
        this.decompressor.on('end', () => {
            super.end();
        });
        this.decompressor.on('error', (error) => {
            this.emit('error', error);
        });
    }
    write(buffer) {
        this.decompressor.write(buffer);
    }
    end() {
        this.decompressor.end();
    }
}
class ResponseHandler {
    constructor({ gzip }) {
        this.gzip = gzip;
        this.result = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }
    handleResponse({ statusCode, statusMessage, headers }) {
        if (this.gzip === true && headers['content-encoding'] === 'gzip') {
            this.accumulator = new GzipAccumulator();
        }
        else {
            this.accumulator = new Accumulator();
        }
        this.accumulator.on('error', (error) => {
            this.reject(error);
        });
        this.accumulator.on('end', (data) => {
            this.resolve({ statusCode, statusMessage, headers, body: new Body_1.default(data, headers['content-type']) });
        });
    }
    handleData(data) {
        if (this.accumulator !== undefined) {
            this.accumulator.write(data);
        }
    }
    handleEnd() {
        if (this.accumulator !== undefined) {
            this.accumulator.end();
        }
    }
    handleError(error) {
        this.reject(error);
    }
}
exports.default = ResponseHandler;
//# sourceMappingURL=ResponseHandler.js.map