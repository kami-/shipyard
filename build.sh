#!/bin/sh

echo "Building client ..."
cd src/client
webpack
cd -

echo "Building server ..."
cd src/server
webpack
cd -
