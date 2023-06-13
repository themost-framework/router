import { Handler } from 'express';
import * as bytes from 'bytes';
import {is} from 'type-is'
import * as contentType from 'content-type';
import * as getRawBody from 'raw-body';
import { DOMParser } from '@xmldom/xmldom';
import { parseString, ParserOptions } from 'xml2js'

declare interface XmlHandlerOptions {
    limit?: number | string;
    type?: string | string[];
    parserOptions?: ParserOptions
}

function xml(options?: XmlHandlerOptions): Handler {
    const config = Object.assign({}, {
        limit: '1mb',
        type: 'application/xml'
    }, options);
    const mediaTypes: string[] = [].concat(config.type);
    const limit = bytes(config.limit);
    const parserOptions = Object.assign({}, {
        explicitRoot: false,
        explicitArray: false,
    }, options && options.parserOptions)
    return (req, res, next) => {
        const parsedContentType = contentType.parse(req);
        if (parsedContentType == null) {
            return next();
        }
        const mediaType = parsedContentType.type;
        if (is(mediaType, mediaTypes) === false) {
            return next();
        }
        void getRawBody(req, {
            length: req.get('content-length'),
            limit: limit
          }, (err?: Error, data?: Buffer) => {
            if (err) {
                return next(err);
            }
            if (data != null) {
                try {
                    const errors: string[] = [];
                    const parser = new DOMParser({
                        locator:{
                        },
                        errorHandler:function(msg){
                                errors.push(msg);
                            }
                    });
                    const str = data.toString(parsedContentType.parameters.charset as BufferEncoding)
                    const doc = parser.parseFromString(str, 'application/xml');
                    if (errors.length) {
                        return next(new Error(errors.join(' ')))
                    }
                    return parseString(doc.documentElement, parserOptions, (err, result) => {
                        if (err) {
                            return next(err);
                        }
                        req.body = result;
                        return next();
                    });
                } catch (error) {
                    return next(error);
                }
            }
            return next();
          });
    }
}

export {
    XmlHandlerOptions,
    xml
}