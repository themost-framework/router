// MOST Web Framework Codename ZeroGravity, copyright 2017-2020 THEMOST LP all rights reserved
import { ApplicationService, ApplicationBase, PathUtils } from '@themost/common';
import {HttpRoute, HttpRouteConfig} from './HttpRoute';

class RouterService extends ApplicationService {
    public readonly routes: HttpRouteConfig[] = [];
    constructor(app: ApplicationBase) {
        super(app);
    }

    /**
     * Appends a route to routes collection
     * @param item
     */
    add(item: HttpRouteConfig): this {
        this.routes.push(item);
        return this;
    }

    /**
     * Adds a collection of routes
     * @param item
     */
    addRange(...item: HttpRouteConfig[]): this {
        this.routes.push.apply(this.routes, item);
        return this;
    }

    private _parseChildren(current: HttpRouteConfig, url: string): HttpRoute {
        const children = current.children;
        if (Array.isArray(children)) {
            const route = new HttpRoute();
            for (const child of children) {
                route.routeConfig = Object.assign({}, {
                    ...current
                }, {
                    children: [],
                    redirectTo: null
                }, {
                    ...child
                }, {
                    path: PathUtils.join(current.path, child.path),
                    parent: current
                });
                let isMatch = route.isMatch(url);
                if (isMatch) {
                    return route;
                }
                if (Array.isArray(child.children)) {
                    const found = this._parseChildren(child, url);
                    if (found) {
                        return found;
                    }
                }
            }
        }
        return;
    }

    parseUrl(url: string, startIndex: number = 0): HttpRoute {
        const route = new HttpRoute();
        // tslint:disable-next-line:prefer-for-of
        for(let i = startIndex; i < this.routes.length; i++) {
            const current = this.routes[i];
            // validate route
            route.routeConfig = current;
            // if route is match
            if (route.isMatch(url)) {
                if (Array.isArray(current.children) && current.children.length > 0) {
                    const child = this._parseChildren(current, url);
                    if (child) {
                        if (child.routeConfig.redirectTo != null) {
                            return this.parseUrl(PathUtils.join(url, child.routeConfig.redirectTo));
                        }
                        return child;
                    }
                } else {
                    return route;
                }
            }
            if (Array.isArray(current.children)) {
                const found = this._parseChildren(current, url);
                if (found) {
                    if (found.routeConfig.redirectTo != null) {
                        return this.parseUrl(PathUtils.join(url, found.routeConfig.redirectTo));
                    }
                    return found;
                }
            }
        }
        return;
    }

}

export {
    RouterService
}