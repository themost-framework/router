// MOST Web Framework Codename ZeroGravity, copyright 2017-2020 THEMOST LP all rights reserved
import {HttpApplicationBase, RouterService} from '@themost/router';
import { getApplication } from '@themost/test';

class UserController {

}

describe('RouterService', () => {

    it('should create instance', () => {
        const container = getApplication();
        const app: HttpApplicationBase = container.get('ExpressDataApplication');
        app.useService(RouterService);
        const service = app.getService(RouterService);
        service.add({
            path: '/users/:action',
            controller: 'users'
        });
        expect(service).toBeTruthy();
    });

    it('should use addRange', () => {
        const container = getApplication();
        const app: HttpApplicationBase = container.get('ExpressDataApplication');
        app.useService(RouterService);
        const service = app.getService(RouterService);
        service.addRange({
            path: '/users/:action',
            controller: 'users'
        }, {
            path: '/products/:action',
            controller: 'products'
        });
        const routeConfig = service.routes.find((item) => {
            return item.controller === 'products';
        })
        expect(routeConfig).toBeTruthy();
    });

    it('should use parseUrl', () => {
        const container = getApplication();
        const app: HttpApplicationBase = container.get('ExpressDataApplication');
        app.useService(RouterService);
        const service = app.getService(RouterService);
        service.addRange({
            path: '/users/:action',
            controller: 'users'
        }, {
            path: '/products/:action',
            controller: 'products'
        });
        const route = service.parseUrl('/users/me');
        expect(route).toBeTruthy();
        expect(route.params.action).toBe('me');
    });

    it('should use child route', () => {
        const container = getApplication();
        const app: HttpApplicationBase = container.get('ExpressDataApplication');
        app.useService(RouterService);
        const service = app.getService(RouterService);
        service.add({
            path: 'users',
            controller: UserController,
            children: [
                {
                    path: 'index',
                    redirectTo: 'me'
                },
                {
                    path: ':action'
                }
            ]
        });
        const route = service.parseUrl('/users/me');
        expect(route).toBeTruthy();
        expect(route.params.action).toEqual('me');
    });

    it('should use redirect', () => {
        const container = getApplication();
        const app: HttpApplicationBase = container.get('ExpressDataApplication');
        app.useService(RouterService);
        const service = app.getService(RouterService);
        service.addRange({
            path: 'users',
            controller: UserController,
            children: [
                {
                    path: '',
                    redirectTo: 'me'
                },
                {
                    path: ':action'
                }
            ]
        }, {
            path: 'home/me',
            redirectTo: '/users/me'
        });
        let route = service.parseUrl('/users');
        expect(route).toBeTruthy();
        expect(route.params.action).toEqual('me');

        route = service.parseUrl('/home/me');
        expect(route).toBeTruthy();
        expect(route.params.action).toEqual('me');
        expect(route.routeConfig.controller).toEqual(UserController);
    });

});
