import {HttpConsumer, HttpContext} from '@themost/router';
import { app } from './examples/app1/app';
import * as request from 'supertest';
describe('Express', () => {

    beforeAll(() => {
       
    });
    
    it('should get hello message', async () => {
        const response = await request(app)
            .get('/home')
            .set('Content-Type', 'application/json');
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

    it('should post and parse body', async () => {
        const response = await request(app)
            .post('/home/replyWithMessage')
            .set('Content-Type', 'application/json')
            .send({
                message: 'Hi User!'
            })
        expect(response.ok).toBeTruthy();
        expect(response.body).toEqual({
            reply: 'Hi User!'
        });
    });

    it('should post empty body', async () => {
        const response = await request(app)
            .post('/home/replyWithMessage')
            .set('Content-Type', 'application/json')
            .send()
        expect(response.ok).toBeFalsy();
    });

    it('should get messages', async () => {
        const response = await request(app)
            .get('/home/messages')
            .set('Content-Type', 'application/json')
            .send()
        expect(response.ok).toBeFalsy();
        expect(response.status).toEqual(401);
    });

    it('should get inherited action', async () => {
        const response = await request(app)
            .get('/home/version')
            .set('Content-Type', 'application/json')
            .send()
        expect(response.ok).toBeTruthy();
        expect(response.body.version).toEqual('latest');
    });

    it('should get users', async () => {
        const response = await request(app)
            .get('/users/')
            .set('Accept', 'application/json')
            .send()
        expect(response.ok).toBeTruthy();
        expect(response.body).toBeInstanceOf(Array);
    });
});
