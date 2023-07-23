import { HttpController, httpActionConsumer, httpController, httpGet, httpPost } from '@themost/router';
import { BaseController } from './BaseController';
import { AccessDeniedError } from '@themost/common';

class ClientMessage {
    message: string
}

@httpController({
    name: 'hello'
})
export class HelloController extends BaseController {
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

    @httpGet({
        name: 'messages'
    })
    @httpActionConsumer(async (context) => {
        const username = (context.user && context.user.name) || 'anonymous';
        if (username === 'anonymous') {
            throw new AccessDeniedError();
        }
    })
    getMessages() {
        return this.json([
            {
                message: 'Hello World'
            }
        ]);
    }
}
