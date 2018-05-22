import util from 'util';
import iconv from 'iconv-lite';

export default class Body {

  private readonly buffer: Buffer;
  private readonly contentType?: string;
  private string?: string;
  private json?: any;
  
  constructor(buffer: Buffer, contentType?: string) {
    this.buffer = buffer;
    this.contentType = contentType;
  }

  private parseCharset(): string | undefined {
    if (this.contentType !== undefined) {
      const result = this.contentType.match(/^.*;\s*charset\s*=\s*(.*?)\s*(?:|;.*)$/i);
      if (result !== null) {
        return result[1];
      }
    }
    return undefined;
  }

  asString(): string {
    if (this.string === undefined) {
      const charset = this.parseCharset();
      if (charset !== undefined) {
        this.string = iconv.decode(this.buffer, charset);
      } else {
        this.string = this.buffer.toString();
      }
    }
    return this.string;
  }

  asJSON(): any {
    if (this.json === undefined) {
      this.json = JSON.parse(this.asString());
    }
    return this.json;
  }

  asBuffer(): Buffer {
    return this.buffer;
  }

  toString(): string {
    return this.asString();
  }

  [util.inspect.custom](): any {
    return this.asString();
  }
}
