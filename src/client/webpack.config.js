const path = require("path");
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        mission: "./App.ts",
        ts: "./extra/ts/App.ts",
        re: "./extra/re/App.ts"
    },

    output: {
        path: path.resolve(__dirname, "../../release/resources/client"),
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
            { from: "resources", to: "" },
        ])
    ]
};