import { useMemo, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { changeTabHandler } from './utils'

export default function BoardList({ url, sortDesc, sortType, subjects, setSubjects, setThreadTabs, activeThreadTab, setActiveThreadTab }) {
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
            ? b.date - a.date
            : a.date - b.date
    )
  }, [sortDesc, sortType, subjects])

  return (
    <section className={cn('divide-y')}>
      {sortedSubjects.map(({ dat, url, subject, ikioi, res, date, readCgiUrl }) => (
        <article key={dat} className={cn('py-2 px-4 break-words')}>
          <a
            href={readCgiUrl}
            onClick={(e) => {
              e.preventDefault()
              setThreadTabs(tabs =>
                tabs.find(v => v.url === url)
                  ? tabs
                  : [...tabs, { url, title: subject }]
              )
              // setActiveThreadTab(url)
              changeTabHandler({
                newTab: url,
                scrollElement: document.getElementById('thread-scroll-area'),
                activeTab: activeThreadTab,
                setActiveTab: setActiveThreadTab,
              })
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
              <time className="w-28" dateTime={new Date(date).toISOString()}>
                {new Intl.DateTimeFormat(navigator.language ?? 'en', {
                  dateStyle: 'medium',
                  timeStyle: 'medium',
                }).format(new Date(date))}
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