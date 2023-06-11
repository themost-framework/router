// MOST Web Framework Codename ZeroGravity, copyright 2017-2023 THEMOST LP all rights reserved

export const HTTP_ROUTE_PATTERNS: Map<string, any> = new Map([
    ['int', () => {
        return '^[1-9]([0-9]*)$';
    }],
    ['boolean', () => {
        return '^true|false$';
    }],
    ['decimal', () => {
        return '^[+-]?[0-9]*\\.?[0-9]*$';
    }],
    ['float', () => {
        return '^[+-]?[0-9]*\\.?[0-9]*$';
    }],
    ['guid', () => {
        return '^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$';
    }],
    ['string', () => {
        return '^\'(.*)\'$';
    }],
    ['date', () => {
        return '^(datetime)?\'\\d{4}-([0]\\d|1[0-2])-([0-2]\\d|3[01])(?:[T ](\\d+):(\\d+)(?::(\\d+)(?:\\.(\\d+))?)?)?(?:Z(-?\\d*))?([+-](\\d+):(\\d+))?\'$';
    }]
]);

declare interface HttpRouteParameter {
    name: string;
    pattern?: RegExp;
    parser?: any;
    value?: any;
}

export declare interface HttpRouteConfig {
    path: string;
    index?: number;
    controller?: any;
    action?: string;
    redirectTo?: string;
    children?: HttpRouteConfig[]
    [k:string]: any;
}

export const HTTP_ROUTE_PARSERS: Map<string, any> = new Map([
    ['int', (value: any) => {
        return parseInt(value, 10);
    }],
    ['boolean', (value: any) => {
        return /^true$/ig.test(value);
    }],
    ['decimal', (value: any) => {
        return parseFloat(value);
    }],
    ['float', (value: any) => {
        return parseFloat(value);
    }],
    ['string', (value: any) => {
        return value.replace(/^'/,'').replace(/'$/,'');
    }],
    ['date', (value: any) => {
        return new Date(Date.parse(value.replace(/^(datetime)?'/,'').replace(/'$/,'')));
    }]

]);

function resolveRootRelative(url: string) {
    if (url.startsWith('/')) {
        return url;
    }
    return '/' + url;
}

export class HttpRoute {

    public params: any = {};

    constructor(public routeConfig?: HttpRouteConfig) {
    }

    isMatch(urlToMatch: string) {
        if (this.routeConfig == null) {
            throw new Error('Route may not be null');
        }
        if (typeof urlToMatch !== 'string')
            return false;
        if (urlToMatch.length === 0)
            return false;
        let str1 = urlToMatch;
        let patternMatch;
        let parser;
        const k = urlToMatch.indexOf('?');
        if (k >= 0) {
            str1 = urlToMatch.substr(0, k);
        }
        const re = /({([\w[\]]+)(?::\s*((?:[^{}\\]+|\\.|{(?:[^{}\\]+|\\.)*})+))?})|((:)([\w[\]]+))/ig;
        let match = re.exec(this.routeConfig.path);
        const routeParams: HttpRouteParameter[] = [];
        while(match) {
            if (typeof match[2] === 'undefined') {
                // parameter with colon (e.g. :id)
                routeParams.push({
                    name: match[6]
                });
            }
            else if (typeof match[3] !== 'undefined') {
                // common expressions
                patternMatch = match[3];
                parser = null;
                if (HTTP_ROUTE_PATTERNS.has(match[3])) {
                    patternMatch = HTTP_ROUTE_PATTERNS.get(match[3])();
                    if (HTTP_ROUTE_PARSERS.has(match[3])) {
                        parser = HTTP_ROUTE_PARSERS.get(match[3]);
                    }
                }
                routeParams.push({
                    name: match[2],
                    pattern: new RegExp(patternMatch, 'ig'),
                    parser
                });
            }
            else {
                routeParams.push({
                    name: match[2]
                });
            }
            match = re.exec(this.routeConfig.path);
        }
        let str;
        let matcher;
        const routePath = resolveRootRelative(this.routeConfig.path);
        str = routePath.replace(re, '([\\$_\\-.:\',+=%0-9\\w-]+)');
        matcher = new RegExp('^' + str + '$', 'ig');
        match = matcher.exec(str1);
        if (typeof match === 'undefined' || match === null) {
            return false;
        }
        let decodedMatch;
        for (let i = 0; i < routeParams.length; i++) {
            const param = routeParams[i];
            if (typeof param.pattern !== 'undefined') {
                if (!param.pattern.test(match[i+1])) {
                    return false;
                }
            }
            decodedMatch = decodeURIComponent(match[i+1]);
            if (typeof param.parser === 'function') {
                param.value = param.parser((match[i+1] !== decodedMatch) ? decodedMatch : match[i+1]);
            }
            else {
                param.value = (match[i+1] !== decodedMatch) ? decodedMatch : match[i+1];
            }

        }
        // set route data
        routeParams.forEach((x) => {
            Object.defineProperty(this.params, x.name, {
                configurable: true,
                enumerable: true,
                writable: true,
                value: x.value
            });
        });
        // set controller
        if (Object.prototype.hasOwnProperty.call(this.routeConfig, 'controller')) {
            Object.defineProperty(this.params, 'controller', {
                configurable: true,
                enumerable: true,
                writable: true,
                value: this.routeConfig.controller
            });
        }
        // set action
        if (Object.prototype.hasOwnProperty.call(this.routeConfig, 'action')) {
            Object.defineProperty(this.params, 'action', {
                configurable: true,
                enumerable: true,
                writable: true,
                value: this.routeConfig.action
            });
        }
        return true;
    }

}
