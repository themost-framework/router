import {HttpConsumer, HttpContext} from '@themost/router';
import { app } from './examples/app1/app';
import * as request from 'supertest';
describe('HttpViewResult', () => {

    beforeAll(() => {
       
    });
    
    it('should get index view', async () => {
        const response = await request(app)
            .get('/')
        expect(response.ok).toBeTruthy();
        expect(response.text).toEqual(`<p>
    Hello World!
</p>`);
    });
    
});
