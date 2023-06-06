import { ApplicationBase } from '@themost/common';
import { RouterService } from '../src/index';
import { getApplication } from '@themost/test';

describe('Service', () => {
    let app: ApplicationBase;
    beforeAll(() => {
        const container = getApplication();
        app = container.get('ExpressDataApplication');
    });
    it('should create instance', () => {
        const service = new RouterService(app);
        expect(service).toBeInstanceOf(RouterService);
    });
});