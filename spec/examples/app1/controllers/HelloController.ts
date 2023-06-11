import { HttpController, httpController, httpGet, httpPost } from '@themost/router';

@httpController('hello')
export class HelloController extends HttpController {
    constructor() {
        super();
    }
    
    @httpGet({
        name: 'index'
    })
    index() {
        return this.json({
            message: 'Hello World!'
        });
    }

    @httpPost({
        name: 'reply',
        params: [
            {
                name: 'message',
                maxLength: 512
            }
        ]
    })
    reply(message: string) {
        return this.json({
            reply: message
        });
    }
}
