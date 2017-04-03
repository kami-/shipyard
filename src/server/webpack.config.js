const path = require("path");
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        app: "./index.ts"
    },

    output: {
        path: path.resolve(__dirname, "../../release"),
        filename: "[name].js"
    },

    target: 'node',

    resolve: {
        extensions: [".ts", ".js"],
        modules: ["node_modules"]
    },

    module: {
        rules: [
            { test: /\.ts?$/, use: "ts-loader" }
        ]
    },

    plugins: [
        new CopyWebpackPlugin([
            { from: "resources/mission", to: "resources/server/mission" },
        ])
    ]
};
