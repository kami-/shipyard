#!/bin/sh

echo "Building client ..."
tsc -p src/ts/client && browserify src/js/client/App.js -o src/resources/client/main.js
echo "Building Town Sweep client ..."
browserify src/js/client/extra/ts/App.js -o src/resources/client/town-sweep.js
echo "Building Random Engagements client ..."
browserify src/js/client/extra/re/App.js -o src/resources/client/random-engagements.js
echo "Building server ..."
tsc -p src/ts/server