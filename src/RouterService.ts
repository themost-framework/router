// MOST Web Framework Codename ZeroGravity, copyright 2017-2020 THEMOST LP all rights reserved
import { ApplicationService, ApplicationBase } from '@themost/common';
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

    parseUrl(url: string, startIndex: number = 0): HttpRoute {
        const route = new HttpRoute();
        // tslint:disable-next-line:prefer-for-of
        for(let i = startIndex; i < this.routes.length; i++) {
            // validate route
            route.routeConfig = this.routes[i];
            // if route is match
            if (route.isMatch(url)) {
                // return it
                return route;
            }
        }
        return;
    }

}

export {
    RouterService
}