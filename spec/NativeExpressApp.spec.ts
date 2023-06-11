import {HttpConsumer, HttpContext} from '@themost/router';
import { app } from './examples/app1/app';
import * as request from 'supertest';
describe('Express', () => {

    beforeAll(() => {
       
    });
    
    it('should get hello message', async () => {
        const response = await request(app).get('/home');
        expect(response.ok).toBeTruthy();
        expect(response.body).toEqual({
            message: 'Hello World!'
        });
    });

    it('should post reply message', async () => {
        const response = await request(app)
            .post('/home/reply')
            .set('Content-Type', 'application/json')
            .send({
                message: 'Hi User!'
            })
        expect(response.ok).toBeTruthy();
        expect(response.body).toEqual({
            reply: 'Hi User!'
        });
    });
});
