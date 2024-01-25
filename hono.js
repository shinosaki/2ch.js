import { Hono } from 'hono'
import { decode } from 'iconv-lite'
import { Dat, Subject, Setting } from './lib'

const app = new Hono()

const welcomeMessage = {
  res: 1,
  subject: '2ちゃんねるリーダー 2ch.js について',
  comments: [{
    id: 1,
    body: [
      '2ch.jsはウェブブラウザで動作する2ch互換掲示板ビューアです',
      '',
      'バグ報告は<a href="https://github.com/shinosaki/2ch.js/issues" target="_blank" rel="noopener noreferrer">GithubのIssue</a>から'
    ].join('<br>'),
    uid: 'nullpo',
    name: '2ch.js',
    email: '',
    date: '2024-01-25T08:11:06.085Z'
  }]
}

app.get('/dat', async (c) => {
  const { url } = c.req.query()

  if (url === '/welcome.dat') {
    return c.json(welcomeMessage)
  }

  const data = await fetch(url).then(r => r.arrayBuffer());
  const decoded = decode(new Uint8Array(data), 'SJIS');
  return c.json(Dat(decoded));
});

app.get('/subject', async (c) => {
  const { url } = c.req.query()
  const data = await fetch(url).then(r => r.arrayBuffer());
  const decoded = decode(new Uint8Array(data), 'SJIS');
  return c.json(Subject(decoded, url));
});

app.get('/setting', async (c) => {
  const { url } = c.req.query()
  const data = await fetch(url).then(r => r.arrayBuffer());
  const decoded = decode(new Uint8Array(data), 'SJIS');
  c.header('Cache-Control', 'max-age=86400')
  return c.json(Setting(decoded));
});

app.get('/welcome.dat', async (c) => {
  // const message = [
  //   '2ch.jsは、ウェブブラウザで動作する2ch互換掲示板ビューア'
  // ].join('<br>')

})

// itest api
  // app.get('/:board/subback', async (c) => {
  //   const { board } = c.req.param()
  //   const url = `https://itest.5ch.net/subbacks/${board}.json`
  //   const data = await fetch(url).then(r => r.json())
  //   return c.json(data)
  // })
  // app.get('/:board/:id', async (c) => {
  //   const serverList = {
  //     poverty: 'greta',
  //     livegalileo: 'nova'
  //   };
  //   const { board, id } = c.req.param()
  //   const server = c.req.query('server') || serverList[board]
  //   const url = `https://itest.5ch.net/cache/${server}/test/read.cgi/${board}/${id}`
  //   const data = await fetch(url).then(r => r.json())
  //   return c.json(data)
  // })

export default app