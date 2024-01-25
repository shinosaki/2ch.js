import { toChildArray, isValidElement } from 'preact';
import { useState, useMemo, useEffect } from 'preact/hooks';
import { trunc } from '../lib';
// import IconSearch from 'icons/IconSearch';
import IconRefresh from 'icons/IconRefresh';
import IconPlus from 'icons/IconPlus';
// import IconX from 'icons/IconX';

export function App() {
  return (
    <Wrapper />
  )
}

function Wrapper () {
  const [threads, setThreads] = useState(
    JSON.parse(localStorage.getItem('threads') ?? '[]')
  );
  const [viewerOpenKey, setViewerOpenKey] = useState(
    JSON.parse(localStorage.getItem('viewerOpenKey') ?? null)
  );

  useEffect(() => {
    localStorage.setItem('threads', JSON.stringify(threads ?? null))
  }, [threads])

  useEffect(() => {
    localStorage.setItem('viewerOpenKey', JSON.stringify(viewerOpenKey ?? null))
  }, [viewerOpenKey])

  return (
    <div class="grid grid-cols-3">
      <Subback
        threads={threads}
        setThreads={setThreads}
        setViewerOpenKey={setViewerOpenKey}
      />
      <Viewer
        threads={threads}
        setThreads={setThreads}
        viewerOpenKey={viewerOpenKey}
        setViewerOpenKey={setViewerOpenKey}
      />
    </div>
  )
}

function Subjects ({ url, sites, setSites, threads, setThreads, setViewerOpenKey }) {
  const [lists, setLists] = useState([]);

  const fetchApi = (options = {}) => {
    fetch(`/api/subject?url=${url}/subject.txt`, options)
      .then(r => r.json())
      .then(r => setLists(r))
  }

  const addHandler = () => {
    const url = window.prompt('Board URL (e.g. "https://greta.5ch.net/poverty")');
    fetch(`/api/setting?url=${url}/SETTING.TXT`, { cache: 'force-cache' })
      .then(r => r.json())
      .then(r => setSites([...sites, { url, title: r.BBS_TITLE_ORIG || url.split('/').pop() }]))
  }

  useEffect(() => {
    fetchApi({ cache: 'force-cache' })
  }, [url])

  const dat2readcgi = v => {
    const url = new URL(v)
    const board = url.pathname.split('/').filter(v => v).shift()
    const id = url.pathname.split('/').pop().split('.')[0]
    return `${url.origin}/test/read.cgi/${board}/${id}`
  }

  const [sortType, setSortType] = useState({})
  const sortHandler = (setLists, { type } = {}) => {
    if (type === 'date') {
      setLists(v => v.toSorted((a, b) => (sortType.date)
        ? Number(a.dat.split('.')[0]) > Number(b.dat.split('.')[0])
        : Number(a.dat.split('.')[0]) < Number(b.dat.split('.')[0])
      ))
      setSortType(v => ({ date: ('date' in v) ? !v.date : true }))
    }
    if (type === 'ikioi') {
      setLists(v => v.toSorted((a, b) => (sortType.ikioi)
        ? a.ikioi > b.ikioi
        : a.ikioi < b.ikioi
      ))
      setSortType(v => ({ ikioi: ('ikioi' in v) ? !v.ikioi : true }))
    }
  }

  return (
    <>
      <ul class="divide-y-2 text-sm">
        {lists.map(({ subject, res, url, dat, ikioi }) => (
          <li class="p-1.5 break-words">
            <a href={dat2readcgi(url)} onClick={e => {
              e.preventDefault();
              if (!threads.some(v => v.url === url)) {
                fetch(`/api/dat?url=${url}`, { cache: 'force-cache' })
                  .then(r => r.json())
                  .then(r => setThreads(v => [...v, { url, title: r.subject || url.split('/').pop().replace('.dat', '') }]))
              };
              setViewerOpenKey(url);
            }}>{subject} ({res})</a>
            <div class="justify-end flex gap-2">
              <p class="text-xs">{trunc(ikioi, 0)}</p>
              <p class="text-xs font-bold">
                {new Intl.DateTimeFormat('ja-JP', {
                  dateStyle: 'medium',
                  timeStyle: 'medium'
                }).format(new Date(Number(dat.split('.')[0]) * 1000))}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <nav class="sticky bottom-0 p-1.5 bg-gray-300 flex gap-2">
        <button onClick={() => sortHandler(setLists, { type: 'date' })} class="text-sm font-bold flex flex-col justify-center">
          <span>日付</span>
          {(sortType.date == null) ? '' : <><span>{(sortType.date) ? '(新)' : '(古)'}</span></>}
        </button>
        <button onClick={() => sortHandler(setLists, { type: 'ikioi' })} class="text-sm font-bold mr-auto">勢い</button>
        <button onClick={addHandler}><IconPlus size={30} /></button>
        <button onClick={fetchApi}><IconRefresh size={30} /></button>
      </nav>
    </>
  )
}

function Subback ({ setViewerOpenKey, threads, setThreads }) {
  const [sites, setSites] = useState(
    JSON.parse(localStorage.getItem('sites') ?? '[]')
  );
  const [subbackOpenKey, setSubbackOpenKey] = useState(
    JSON.parse(localStorage.getItem('subbackOpenKey'))
  );

  useEffect(() => {
    localStorage.setItem('sites', JSON.stringify(sites ?? null))
  }, [sites])

  useEffect(() => {
    localStorage.setItem('subbackOpenKey', JSON.stringify(subbackOpenKey ?? null))
  }, [subbackOpenKey])

  useEffect(() => {
    if (!JSON.parse(localStorage.getItem('sites')).length) {
      const defaultBoards = [
        'https://greta.5ch.net/poverty',
        'https://nova.5ch.net/livegalileo'
      ];

      Promise.all(
        defaultBoards.map((url) =>
          fetch(`/api/setting?url=${url}/SETTING.TXT`, { cache: 'force-cache' })
            .then(r => r.json())
            .then(r => [url, r])
        )
      ).then(r => {
        const z = r.map(([url, v]) => ({ url, title: v.BBS_TITLE_ORIG || url.split('/').pop() }))
        setSites([...sites, ...z])
      })
    }
  }, [])

  return (
    <div class="col-span-1 relative h-screen overflow-y-scroll">
      <Tab openKey={subbackOpenKey} setOpenKey={setSubbackOpenKey} setTabArray={setSites}>
        {sites.map(({ title, url }) => (
          <div tabKey={url} title={title}>
            {<Subjects
              url={url}
              sites={sites}
              setSites={setSites}
              threads={threads}
              setThreads={setThreads}
              setViewerOpenKey={setViewerOpenKey}
            />}
          </div>
        ))}
      </Tab>
    </div>
  )
}

function Thread ({ url, threads, setThreads }) {
  const [comments, setComments] = useState([]);

  const fetchApi = (options = {}) => {
    fetch(`/api/dat?url=${url}`, options)
      .then(r => r.json())
      .then(r => setComments(r.comments))
  }

  const addHandler = () => {
    const url = window.prompt('Thread URL (e.g. "https://greta.5ch.net/poverty/dat/1705137573.dat")');
    fetch(`/api/dat?url=${url}`, { cache: 'force-cache' })
      .then(r => r.json())
      .then(r => setThreads([...threads, { url, title: r.subject || url.split('/').pop().replace('.dat', '') }]))
  }

  useEffect(() => {
    fetchApi({ cache: 'force-cache' })
  }, [url])

  return (
    <>
      <ul class="divide-y-2">
        {comments.map(({ id, body, uid, be, name, email, date, anchor }) => (
          <li class="message p-1">
            <div class="flex gap-2">
              <p>{id} <span class={anchor ? '' : 'hidden'}>({anchor})</span></p>
              <p>{(email)
                ? (<a href={`mailto:${email}`}><span dangerouslySetInnerHTML={{ __html: name }} /></a>)
                : (<span dangerouslySetInnerHTML={{ __html: name }} />)
              }</p>
              <p>{date}</p>
              <p>{uid}</p>
            </div>
            <div class="body break-words" dangerouslySetInnerHTML={{ __html: body }} />
          </li>
        ))}
      </ul>
      <nav class="sticky bottom-0 p-1.5 bg-gray-300 flex justify-between">
        <button onClick={addHandler}><IconPlus size={30} /></button>
        <button onClick={fetchApi}><IconRefresh size={30} /></button>
      </nav>
    </>
  )
}

function Viewer ({ threads, setThreads, viewerOpenKey, setViewerOpenKey }) {
  useEffect(() => {
    if (!JSON.parse(localStorage.getItem('threads')).length) {
      const defaultThreads = [
        '/welcome.dat'
      ];

      Promise.all(
        defaultThreads.map((url) =>
          fetch(`/api/dat?url=${url}`, { cache: 'force-cache' })
            .then(r => r.json())
            .then(r => [url, r])
        )
      ).then(r => {
        const z = r.map(([url, v]) => ({ url, title: v.subject || url.split('/').pop().replace('.dat', '') }))
        setThreads([...threads, ...z])
      })
    }
  }, [])

  return (
    <div class="col-span-2 relative h-screen overflow-y-scroll">
      <Tab openKey={viewerOpenKey} setOpenKey={setViewerOpenKey} setTabArray={setThreads}>
      {threads.map(({ title, url }) => (
        <div tabKey={url} title={title}>
          {<Thread url={url} threads={threads} setThreads={setThreads} />}
        </div>
      ))}
      </Tab>
    </div>
  )
}

// https://zenn.dev/happou31/articles/903bbaf78c33dd
function Tab({ openKey, setOpenKey, children, defaultOpenKey, setTabArray }) {
  // const [openKey, setOpenKey] = useState(defaultOpenKey);

  const tabs = useMemo(() =>
    toChildArray(children).map((child) =>
      isValidElement(child)
        ? { title: child.props.title, children: child.props.children, tabKey: child.props.tabKey }
        : null
    )?.filter((item) => item != null) ?? [],
  [children]);

  return (
    <>
      <div class="sticky top-0 divide-x bg-white flex flex-wrap">
        {tabs.map((element, index) => (
          <button
            onClick={e => {
              e.preventDefault();
              setOpenKey(element.tabKey);
            }}
            onMouseDown={e => {
              if (e.button === 1) { // Middle click
                setTabArray(v => v.filter((z, i) => {
                  if (openKey === element.tabKey) setOpenKey(v[i - 1]?.url)
                  return z.url !== element.tabKey
                }));
              }
            }}
            key={element.tabKey}
            class={[
              'py-0.5', 'px-1', 'border-b-4', 'text-sm',
              (element.tabKey === openKey || (openKey == null && index === 0)) ? 'border-b-cyan-400' : 'border-black/20'
            ].join(' ')}
          >{element.title}</button>
        ))}
      </div>
      <div>
        {tabs.find(element => element.tabKey === openKey)?.children ?? toChildArray(children)[0]}
      </div>
    </>
  );
}