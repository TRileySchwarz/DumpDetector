#!/usr/bin/env bash

npm install
NODE_ENV=development forever start scripts/Bot.js
