# 2ch.js
[![npm version](https://badge.fury.io/js/2ch.js.svg)](https://badge.fury.io/js/2ch.js)

ウェブブラウザで動作する2ch互換掲示板ビューア/DATパーサー

![ScreenShot](https://github.com/shinosaki/2ch.js/assets/88357168/ff69cafb-fb96-429f-bf57-0f576ead7e3b)

## ToDo
- タブの永続化

## Deploy
```bash
## Cloudflare Workers
$ npm run deploy:worker

## Cloudflare Pages
$ npm run deploy:pages

## Bun (Generate executable file)
## https://bun.sh/docs/bundler/executables
$ npm run build:bun
$ NODE_ENV=production ./dist/run
## And open http://localhost:3000
```

## License
[MIT](./LICENSE)
