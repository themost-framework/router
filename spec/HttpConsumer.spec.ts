import { ApplicationBase } from '@themost/common';
import {HttpConsumer, HttpContext} from '@themost/router';
import { getApplication } from '@themost/test';
describe('HttpConsumer', () => {

    let app: ApplicationBase;
    beforeAll(() => {
        const container = getApplication();
        app = container.get('ExpressDataApplication');
    });
    
    it('should create instance', async () => {
        const consumer = new HttpConsumer(function(value: any) {
            expect(this).toBeInstanceOf(HttpContext);
            return Promise.resolve(value);
        });
        const context = new HttpContext(app);
        const res = await consumer.run(context, true);
        expect(res).toBeTruthy();
    });
});
