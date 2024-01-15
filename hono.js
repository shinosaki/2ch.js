import { Hono } from 'hono'
import { decode } from 'iconv-lite'

const app = new Hono()

const unescaping = (raw) => {
  return (raw)
    ? raw.replaceAll(/(h?ttps?:\/\/[\w:@\-\.\/\?#=]+)/ig, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
    : raw;
};

const parseDat = (str) => {
  const lines = str.split('\n');
  const subject = lines[0].split('<>').pop();

  const comments = lines.filter(v=>v).map((v, i) => {
    const [ name, email, meta, rawBody ] = v.split('<>');
    const [ rawDate, uid, be ] = meta.split(/ ID:| BE:/);

    // タイムゾーンを考慮しないといけない??
    // '2023/08/27(水) 17:15:13.363'
    // to [ "2023", "08", "27", "水", "", "17", "15", "13", "363" ]
    const [ year, month, day, week, _, hour, min, sec, msec ] = rawDate.split(/[\/\(\)\s\.:]/);
    const date = new Date(year, month - 1, day, hour, min, sec, msec);

    return {
      id: i + 1,
      body: unescaping(rawBody),
      uid, be, name, email, date, rawDate, rawBody,
    };
  });

  return {
    res: lines.length - 1,
    subject,
    comments,
  };
};

const parseSubject = (str, url) => {
  const lines = str.split('\n');
  return lines.filter(v=>v).map((v) => {
    const pattern = /(?<dat>\d+\.dat)<>(?<subject>.*)\s\((?<res>\d+)\)/;
    const { dat, subject, res } = v.match(pattern)?.groups;
    return {
      dat,
      subject,
      url: url.replace('subject.txt', `dat/${dat}`),
      res: Number(res)
    }
  })
}

const parseSetting = (str) => {
  const lines = str.split('\n');
  const entries = lines.filter(v=>v.includes('=')).map(v => {
    const [key, ...value] = v.split('=');
    return [key, value.join('=')];
  })
  return Object.fromEntries(entries)
}

app.get('/dat', async (c) => {
  const { url } = c.req.query()
  const data = await fetch(url).then(r => r.arrayBuffer());
  const decoded = decode(new Uint8Array(data), 'SJIS');
  return c.json(parseDat(decoded));
});

app.get('/subject', async (c) => {
  const { url } = c.req.query()
  const data = await fetch(url).then(r => r.arrayBuffer());
  const decoded = decode(new Uint8Array(data), 'SJIS');
  return c.json(parseSubject(decoded, url));
});

app.get('/setting', async (c) => {
  const { url } = c.req.query()
  const data = await fetch(url).then(r => r.arrayBuffer());
  const decoded = decode(new Uint8Array(data), 'SJIS');
  c.header('Cache-Control', 'max-age=86400')
  return c.json(parseSetting(decoded));
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