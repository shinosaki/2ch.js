import { useMemo, useEffect } from 'react'
import { cn } from '@/lib/utils'

const Dat2Date = (s) => new Date(Number(s.split('.')[0]) * 1000)
const Dat2ReadCgi = (datUrl) => {
  const { pathname, origin } = new URL(datUrl)
  const [, board, , dat] = pathname.split('/')
  return `${origin}/test/read.cgi/${board}/${dat.split('.')[0]}`
}

export default function BoardList({ url, sortDesc, sortType, subjects, setSubjects, setThreadTabs, setActiveThreadTab }) {
  useEffect(() => {
    fetch(`/api/subject?url=${url}/subject.txt`, { cache: 'force-cache' })
      .then(r => r.json())
      .then(r => setSubjects(r))
  }, [url])

  const sortedSubjects = useMemo(() => {
    return subjects.sort((a, b) =>
      (sortType === 'ikioi')
        ? (sortDesc)
            ? b.ikioi - a.ikioi
            : a.ikioi - b.ikioi
        : (sortDesc)
            ? Dat2Date(b.dat) - Dat2Date(a.dat)
            : Dat2Date(a.dat) - Dat2Date(b.dat)
    )
  }, [sortDesc, sortType, subjects])

  return (
    <section className={cn('divide-y')}>
      {sortedSubjects.map(({ dat, url, subject, ikioi, res }) => (
        <article key={dat} className={cn('py-2 px-4 break-words')}>
          <a
            href={Dat2ReadCgi(url)}
            onClick={(e) => {
              e.preventDefault()
              setThreadTabs(tabs =>
                tabs.find(v => v.url === url)
                  ? tabs
                  : [...tabs, { url, title: subject }]
              )
              setActiveThreadTab(url)
              const interval = setInterval(() => {
                if (document.getElementById(url)) {
                  document.getElementById(url).scrollIntoView()
                  clearInterval(interval)
                }
              })
            }}
            className="contents"
          >
            <h1 className="text-sm">{subject}</h1>
            <footer className={cn('text-xs flex justify-between font-bold')}>
              <time className="w-28" dateTime={Dat2Date(dat).toISOString()}>
                {new Intl.DateTimeFormat(navigator.language ?? 'en', {
                  dateStyle: 'medium',
                  timeStyle: 'medium',
                }).format(Dat2Date(dat))}
              </time>
              <div className={cn('flex gap-2 text-right')}>
                <p className="text-red-600">{Math.trunc(ikioi)}</p>
                <p className="w-7">{res}</p>
              </div>
            </footer>
          </a>
        </article>
      ))}
    </section>
  )
}