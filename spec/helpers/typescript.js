const path = require('path');

require('ts-node').register({
    transpileOnly: true,
    project: path.resolve(process.cwd(), './tsconfig.spec.json'),
    require: [
        "tsconfig-paths/register"
    ]
});