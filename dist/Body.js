"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = __importDefault(require("util"));
const iconv_lite_1 = __importDefault(require("iconv-lite"));
class Body {
    constructor(buffer, contentType) {
        this.buffer = buffer;
        this.contentType = contentType;
    }
    parseCharset() {
        if (this.contentType !== undefined) {
            const result = this.contentType.match(/^.*;\s*charset\s*=\s*(.*?)\s*(?:|;.*)$/i);
            if (result !== null) {
                return result[1];
            }
        }
        return undefined;
    }
    asString() {
        if (this.string === undefined) {
            const charset = this.parseCharset();
            if (charset !== undefined) {
                this.string = iconv_lite_1.default.decode(this.buffer, charset);
            }
            else {
                this.string = this.buffer.toString();
            }
        }
        return this.string;
    }
    asJSON() {
        if (this.json === undefined) {
            this.json = JSON.parse(this.asString());
        }
        return this.json;
    }
    asBuffer() {
        return this.buffer;
    }
    toString() {
        return this.asString();
    }
    [util_1.default.inspect.custom]() {
        return this.asString();
    }
}
exports.default = Body;
//# sourceMappingURL=Body.js.map