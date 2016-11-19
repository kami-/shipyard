var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        mission: "./App.ts",
        ts: "./extra/ts/App.ts",
        re: "./extra/re/App.ts"
    },

    output: {
        path: "../../release/resources/client",
        filename: "js/[name].js"
    },

    devtool: "source-map",

    resolve: {
        extensions: ["", ".ts", ".js"]
    },

    module: {
        loaders: [
            { test: /\.ts?$/, loader: "ts-loader" }
        ],

        preLoaders: [
            { test: /\.js$/, loader: "source-map-loader" }
        ]
    },

    plugins: [
        new CopyWebpackPlugin([
            { from: "resources", to: "" },
        ])
    ]
};