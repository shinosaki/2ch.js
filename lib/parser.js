import { Ikioi } from './utils.js'

const unescaping = (raw) => {
  // regex from https://stackoverflow.com/a/3809435
  const regex = /((http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*))(?![^<]*>|[^<>]*<\/)/ig
  return (raw)
    ? raw
        .replaceAll(/sssp:\/\/([\w\/\.]+\.(gif|jpg|png))/ig, '<img src="https://$1" loading="lazy" />')
        .replaceAll(/<a href="\.\.\/test\/read\.cgi\/.*?\/(\d+)" rel="noopener noreferrer" target="_blank"/ig, '<a href="#comment-$1"')
        .replaceAll(regex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
    : raw;
};

export const Dat = (str) => {
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

const dat2readcgi = (datUrl) => {
  try {
    const { pathname, origin } = new URL(datUrl)
    const [, board, , dat] = pathname.split('/')
    return `${origin}/test/read.cgi/${board}/${dat.split('.')[0]}`
  } catch {
    return null
  }
}

export const Subject = (str, url) => {
  const lines = str.split('\n');
  return lines.filter(v=>v).map((v) => {
    const pattern = /(?<dat>\d+\.dat)<>(?<subject>.*)\s\((?<res>\d+)\)/;
    const { dat, subject, res } = v.match(pattern)?.groups;
    const datUrl = url.replace('subject.txt', `dat/${dat}`);

    return {
      dat,
      subject,
      url: datUrl,
      readCgiUrl: dat2readcgi(datUrl),
      date: new Date(Number(dat.split('.')[0]) * 1000).getTime(),
      res: Number(res),
      ikioi: Ikioi(res, dat.split('.')[0])
    }
  })
}

export const Setting = (str) => {
  const lines = str.split('\n');
  const entries = lines.filter(v=>v.includes('=')).map(v => {
    const [key, ...value] = v.split('=');
    return [key, value.join('=')];
  })
  return Object.fromEntries(entries)
}