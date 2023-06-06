// MOST Web Framework Codename ZeroGravity, copyright 2017-2020 THEMOST LP all rights reserved
import {HttpApplicationBase, RouterService} from '@themost/router';
import { getApplication } from '@themost/test';

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

});
