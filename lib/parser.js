const unescaping = (raw) => {
  return (raw)
    ? raw.replaceAll(/(h?ttps?:\/\/[\w:@\-\.\/\?#=]+)/ig, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
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

export const Subject = (str, url) => {
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

export const Setting = (str) => {
  const lines = str.split('\n');
  const entries = lines.filter(v=>v.includes('=')).map(v => {
    const [key, ...value] = v.split('=');
    return [key, value.join('=')];
  })
  return Object.fromEntries(entries)
}

export default {
  Dat,
  Subject,
  Setting
}