import { Hono } from 'hono'
import { decode } from 'iconv-lite'
import { Dat, Subject, Setting } from '2ch.js'

const app = new Hono()

app.get('/dat', async (c) => {
  const { url } = c.req.query()
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