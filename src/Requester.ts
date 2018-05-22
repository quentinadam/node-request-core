import https from 'https';
import http from 'http';
import { URL } from 'url';
import ResponseHandler from './ResponseHandler';

const httpsAgent = new https.Agent({ keepAlive: true });
const httpAgent = new http.Agent({ keepAlive: true });

export default class Requester {

  protected readonly responseHandler: ResponseHandler;
  protected ended: boolean = false;

  constructor(responseHandler: ResponseHandler) {
    this.responseHandler = responseHandler;
  }

  protected parseURL(url: string): {secure: boolean, host: string, port: number, path: string} {
    const urlObject = new URL(url);
    let secure: boolean;
    if (urlObject.protocol === 'https:') {
      secure = true;
    } else if (urlObject.protocol === 'http:') {
      secure = false;
    } else {
      throw new Error(`Unsupported protocol ${urlObject.protocol}`);
    }
    return {
      secure: secure,
      host: urlObject.hostname,
      port: urlObject.port === '' ? (secure ? 443 : 80) : parseInt(urlObject.port),
      path: urlObject.pathname + urlObject.search,
    }
  }

  public request({url, method, headers, body, timeout}: {
    url: string;
    method: string;
    headers: {[key: string]: string | string[]};
    body?: Buffer;
    timeout: number;
  }) {
    const {secure, host, port, path} = this.parseURL(url);
    const request = secure ? (
      https.request({host, port, path, method, agent: httpsAgent})
    ) : (
      http.request({host, port, path, method, agent: httpAgent})
    );
    for (const key in headers) {
      request.setHeader(key, headers[key]);
    }
    request.setTimeout(timeout);
    request.on('timeout', () => {
      const error = new Error('socket timed out');
      //error.code = 'ECONNTIMEOUT';
      request.socket.destroy(error);
    });
    request.on('response', (response: http.ClientResponse) => {
      this.handleResponse({
        statusCode: <number>response.statusCode,
        statusMessage: <string>response.statusMessage,
        headers: response.headers
      });
      response.on('data', (data: Buffer) => {
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

  handleResponse(response: {
    statusCode: number,
    statusMessage: string,
    headers: http.IncomingHttpHeaders
  }): void {
    this.responseHandler.handleResponse(response);
  }

  handleData(data: Buffer): void {
    this.responseHandler.handleData(data);
  }

  handleEnd(): void {
    this.end(() => {
      this.responseHandler.handleEnd();
    });
  }

  handleError(error: Error): void {
    this.end(() => {
      this.responseHandler.handleError(error);
    });
  }

  protected end(fn: () => void): void {
    if (this.ended === false) {
      this.ended = true;
      fn();
    }
  }

}

