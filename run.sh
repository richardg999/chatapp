#!/usr/bin/env bash

cd client
if [ ! -d "./node_modules" ]; then
  npm install
fi
if [ ! -d "./build" ]; then
  npm run-script build
fi

cd ../server
if [ -x "$(command -v pip3)" ]; then # if pip3 executable exists in PATH
  pip3 install -r requirements.txt
else
  pip install -r requirements.txt
fi
export FLASK_APP=server
flask run