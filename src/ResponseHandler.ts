import http from 'http';
import { EventEmitter } from 'events';
import zlib from 'zlib';
import Body from './Body';
import Result from './Result';

class Accumulator extends EventEmitter {

  protected readonly buffers: Buffer[] = [];

  constructor() {
    super();
  }

  write(data: Buffer): void {
    this.buffers.push(data);
  }

  end(): void {
    this.emit('end', Buffer.concat(this.buffers));
  }
}

class GzipAccumulator extends Accumulator {
  
  private readonly decompressor: zlib.Gunzip;
  
  constructor() {
    super();
    this.decompressor = zlib.createGunzip();
    this.decompressor.on('data', (buffer: Buffer) => {
      this.buffers.push(buffer);
    });
    this.decompressor.on('end', () => {
      super.end();
    });
    this.decompressor.on('error', (error: Error) => {
      this.emit('error', error);
    });
  }

  write(buffer: Buffer): void {
    this.decompressor.write(buffer);
  }

  end(): void {
    this.decompressor.end();
  }
}

export default class ResponseHandler {

  private readonly gzip: boolean;
  public readonly result: Promise<Result>;
  private accumulator?: Accumulator;
  protected resolve!: (result: any) => void;
  protected reject!: (error: Error) => void;
  
  constructor({gzip}: {gzip: boolean}) {
    this.gzip = gzip;  
    this.result = new Promise<Result>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  handleResponse({statusCode, statusMessage, headers}: {statusCode: number, statusMessage: string, headers: http.IncomingHttpHeaders}): void {
    if (this.gzip === true && headers['content-encoding'] === 'gzip') {
      this.accumulator = new GzipAccumulator();
    } else {
      this.accumulator = new Accumulator();
    }
    this.accumulator.on('error', (error) => {
      this.reject(error);
    });
    this.accumulator.on('end', (data) => {
      this.resolve({statusCode, statusMessage, headers, body: new Body(data, headers['content-type'])});
    });
  }

  handleData(data: Buffer): void {
    if (this.accumulator !== undefined) {
      this.accumulator.write(data);
    }
  }

  handleEnd(): void {
    if (this.accumulator !== undefined) {
      this.accumulator.end();
    }
  }

  handleError(error: Error): void {
    this.reject(error);
  }
}