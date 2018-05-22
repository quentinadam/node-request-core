/// <reference types="node" />
export default class Body {
    private readonly buffer;
    private readonly contentType?;
    private string?;
    private json?;
    constructor(buffer: Buffer, contentType?: string);
    private parseCharset();
    asString(): string;
    asJSON(): any;
    asBuffer(): Buffer;
    toString(): string;
}
