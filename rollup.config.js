/*eslint-env es6 */
const rollup = require('rollup');
const typescript = require('@rollup/plugin-typescript');
const pkg = require('./package.json');

const external = Object.keys(pkg.dependencies || {}).concat(Object.keys(pkg.peerDependencies || {}))

module.exports = [
    {
        input: './src/index.ts',
        output: [
            {
                name: pkg.name,
                file: `dist/index.cjs.js`,
                format: 'cjs',
                sourcemap: true
            },
            {
                name: pkg.name,
                file: `dist/index.esm.js`,
                format: 'esm',
                sourcemap: true
            },
            {
                name: pkg.name,
                file: `dist/index.umd.js`,
                format: 'umd',
                sourcemap: true
            },
        ],
        external: external,
        plugins: [
            typescript({ tsconfig: './tsconfig.lib.json' })
        ]
    }
];
