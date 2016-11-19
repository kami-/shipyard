var nodeExternals = require('webpack-node-externals');
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        app: "./index.ts"
    },

    output: {
        path: "../../release",
        filename: "[name].js"
    },

    target: 'node',
    externals: [nodeExternals({
        modulesDir: "../../node_modules",
        whitelist: ["config-parser", "fs-extra", "express", "body-parser", "mime", "lodash"]
    })],

    resolve: {
        extensions: ["", ".ts", ".js"]
    },

    module: {
        loaders: [
            { test: /\.ts?$/, loader: "ts-loader" },
            { test: /\.json?$/, loader: "json-loader" }
        ]
    },

    plugins: [
        new CopyWebpackPlugin([
            { from: "resources/mission", to: "resources/server/mission" },
        ])
    ]
};
