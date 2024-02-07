import { useEffect } from 'react'
import { cn } from '@/lib/utils'

export default function ThreadViewer({ url, comments, setComments }) {
  useEffect(() => {
    fetch(`/api/dat?url=${url}`, { cache: 'force-cache' })
      .then(r => r.json())
      .then(r => setComments(r.comments))
  }, [url]);


  const smoothClickHandler = (e) => {
    e.preventDefault()
    const href = e.target.getAttribute('href')
    document.getElementById(href.replace('#', '')).scrollIntoView({ behavior: 'smooth' })
  }
  useEffect(() => {
    const anchors = [...document.querySelectorAll('.message .body a')]
      .filter(e => e.getAttribute('href').startsWith('#comment-'))

    anchors.map(e => e.addEventListener('click', smoothClickHandler))
    return () => anchors.map(e => e.removeEventListener('click', smoothClickHandler))
  }, [comments])

  return (
    <ul className="divide-y scroll-smooth">
      {comments ? comments.map(({ id, body, uid, be, name, email, date, anchor }) => (
        <li key={id} id={`comment-${id}`} className="message p-1">
          <div className="flex flex-wrap gap-x-2">
            <p>{id} <span className={anchor ? '' : 'hidden'}>({anchor})</span></p>
            <p>
              {(email) ? (
                <a href={`mailto:${email}`}>
                  <span dangerouslySetInnerHTML={{ __html: name }} />
                </a>
              ) : (
                <span dangerouslySetInnerHTML={{ __html: name }} />
              )}
            </p>
            <p>{date}</p>
            <p>{uid}</p>
          </div>
          <div className="body break-words" dangerouslySetInnerHTML={{ __html: body }} />
        </li>
      )) : (
        <li>Comment is empty.</li>
      )}
    </ul>
  )

  return (
    <ul className={cn('divide-y')}>
      {comments.map(v => (
        <li key={v.id} className={cn('py-2 px-4 break-words')}>
          <div dangerouslySetInnerHTML={{ __html: v.body }} />
        </li>
      ))}
    </ul>
  )
}