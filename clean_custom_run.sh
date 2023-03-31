#!/bin/bash

set -ex

rm -rf .next/cache
npm install ../xmtp-js/xmtp-xmtp-js-0.0.0-development.tgz
npm install ../libxmtp/bindings/wasm
npm run dev
