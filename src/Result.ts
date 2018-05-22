import Body from './Body';
import http from 'http';

export default interface Result {
  statusCode: number;
  statusMessage: string;
  headers: http.IncomingHttpHeaders;
  body: Body;
}