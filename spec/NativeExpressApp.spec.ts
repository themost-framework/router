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

    // it('should post reply message as xml', async () => {
    //     const response = await request(app)
    //         .post('/home/reply')
    //         .set('Content-Type', 'application/xml')
    //         .send(`<Action>
    //         <message>Hi User!</message>
    //         </Action>`)
    //     expect(response.ok).toBeTruthy();
    //     expect(response.body).toEqual({
    //         reply: 'Hi User!'
    //     });
    // });
});
