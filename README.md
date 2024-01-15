# ch-viewer
ウェブブラウザで動作する2ch互換ビューア

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