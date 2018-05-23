import { URL } from 'url';
import querystring from 'querystring';
import Result from './Result';
import Params from './Params';

export default class Wrapper {

  constructor(private readonly requestFn: (params: {
    url: string, 
    method: string, 
    headers: {[key: string]: string | string[]},
    body?: Buffer,
    gzip: boolean,
    timeout: number
  }) => Promise<Result>) {}

  private combineURL(url: string, qs?: {[key: string]: string}): string {
    if (qs !== undefined) {
      const urlObject = new URL(url);
      if (qs !== undefined) {
        const parameters = urlObject.searchParams;
        for (const key in qs) {
          parameters.append(key, qs[key]);
        }
        urlObject.search = parameters.toString();
      }
      return urlObject.toString();
    } else {
      return url;
    }
  }

  private processParams (params: Params) {
    const url = this.combineURL(params.url, params.qs);
    const headers : {[key: string]: string | string[]} = {};
    if (params.headers !== undefined) {
      for (const key in params.headers) {
        headers[key.toLocaleLowerCase()] = params.headers[key];
      }
    }
    const method: string = (params.method === undefined) ? 'GET': params.method;
    let body: Buffer | undefined;
    if (params.json !== undefined) {
      headers['content-type'] = 'application/json';
      body = Buffer.from(JSON.stringify(params.json));
    } else if (params.form !== undefined) {
      headers['content-type'] = 'application/x-www-form-urlencoded';
      body = Buffer.from(querystring.stringify(params.form));
    } else if (params.body !== undefined) {
      body = params.body;
    }
    if (body !== undefined && body.length > 0) {
      headers['content-length'] = body.length.toString();
    }
    let gzip: boolean;
    if (params.gzip === true || (params.gzip !== false && headers['accept-encoding'] === undefined)) {
      gzip = true;
      headers['accept-encoding'] = 'gzip';
    } else {
      gzip = false;
    }
    if (params.keepAlive === false) {
      headers['connection'] = 'close';
    } else if (params.keepAlive === true || headers['connection'] === undefined) {
      headers['connection'] = 'keep-alive';
    }
    const followRedirect = (params.followRedirect !== false);
    const timeout = params.timeout === undefined ? 15000: params.timeout;
    return { url, headers, method, body, gzip, followRedirect, timeout };
  }

  async request(params: Params): Promise<Result> {
    let { url, headers, method, body, gzip, followRedirect, timeout } = this.processParams(params);
    let count = 0;
    while (true) {
      const result = await this.requestFn({ url, headers, method, body, gzip, timeout });
      const location = result.headers['location'];
      if (followRedirect && (result.statusCode === 301 || result.statusCode === 302) && method == 'GET' && location !== undefined) {
        if (count < 10) {
          count++;
          url = location;
        } else {
          throw new Error('Redirection loop');
        }
      } else {
        return result;
      }
    }
  }

}