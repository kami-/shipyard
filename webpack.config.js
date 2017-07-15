const path = require("path");
const CopyWebpackPlugin = require('copy-webpack-plugin');

const RELEASE_HOME = "./release";
const SERVER_HOME = "./src/server";
const CLIENT_HOME = "./src/client";

const serverConfig = {
    entry: {
        app: SERVER_HOME + "/index.ts"
    },

    output: {
        path: path.resolve(__dirname, RELEASE_HOME),
        filename: "[name].js"
    },

    target: "node",

    resolve: {
        extensions: [".ts", ".js"],
    },

    module: {
        rules: [
            { test: /\.ts?$/, use: "ts-loader" }
        ]
    },

    plugins: [
        new CopyWebpackPlugin([
            { from: SERVER_HOME + "/resources/mission", to: "./resources/server/mission" },
        ])
    ]
};

const clientConfig = {
    entry: {
        mission: CLIENT_HOME + "/App.ts",
        ts: CLIENT_HOME + "/extra/ts/App.ts",
        re: CLIENT_HOME + "/extra/re/App.ts"
    },

    output: {
        path: path.resolve(__dirname, RELEASE_HOME + "/resources/client"),
        filename: "js/[name].js"
    },

    devtool: "source-map",

    resolve: {
        extensions: [".ts", ".js"]
    },

    module: {
        rules: [
            { test: /\.js$/, enforce: "pre", use: "source-map-loader" },
            { test: /\.ts?$/, use: "ts-loader" }
        ]
    },

    plugins: [
        new CopyWebpackPlugin([
            { from: CLIENT_HOME + "/resources" }
        ])
    ]
};

module.exports = [serverConfig, clientConfig];