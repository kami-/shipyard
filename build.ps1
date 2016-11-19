$ErrorActionPreference = "Stop"

echo "Building client ..."
pushd src/client
webpack
popd

echo "Building server ..."
pushd src/server
webpack
popd
