import { toChildArray, isValidElement } from 'preact';
import { useState, useMemo, useEffect } from 'preact/hooks';
import IconSearch from 'icons/IconSearch';
import IconRefresh from 'icons/IconRefresh';
import IconPlus from 'icons/IconPlus';
import IconX from 'icons/IconX';

export function App() {
  return (
    <Wrapper />
  )
}

function Wrapper () {
  const [threads, setThreads] = useState([]);
  const [viewerOpenKey, setViewerOpenKey] = useState();

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

  return (
    <>
      <ul class="divide-y-2 text-sm">
        {lists.map(({ subject, res, url }) => (
          <li class="p-1.5 break-words">
            <a href={url} onClick={e => {
              e.preventDefault();
              const url = e.target.href;
              if (!threads.some(v => v.url === url)) {
                fetch(`/api/dat?url=${url}`, { cache: 'force-cache' })
                  .then(r => r.json())
                  .then(r => setThreads(v => [...v, { url, title: r.subject || url.split('/').pop().replace('.dat', '') }]))
              };
              setViewerOpenKey(url);
            }}>{subject} ({res})</a>
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

function Subback ({ setViewerOpenKey, threads, setThreads }) {
  const [sites, setSites] = useState([]);
  const [subbackOpenKey, setSubbackOpenKey] = useState();

  useEffect(() => {
    const defaultBoards = ['https://greta.5ch.net/poverty', 'https://nova.5ch.net/livegalileo'];

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
            <div class="body" dangerouslySetInnerHTML={{ __html: body }} />
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
    const defaultThreads = [
      // 'https://greta.5ch.net/poverty/dat/1705137573.dat'
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