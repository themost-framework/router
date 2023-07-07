import { HttpController, httpController, httpGet, httpPost } from '@themost/router';

class ClientMessage {
    message: string
}

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
                type: 'Text',
                maxLength: 512
            }
        ]
    })
    reply(message: string) {
        return this.json({
            reply: message
        });
    }

    @httpPost({
        name: 'replyWithMessage',
        params: [
            {
                name: 'replyMessage',
                type: ClientMessage,
                fromBody: true,
                required: true
            }
        ]
    })
    replyWithMessage(replyMessage: ClientMessage) {
        return this.json({
            reply: replyMessage.message
        });
    }
}
