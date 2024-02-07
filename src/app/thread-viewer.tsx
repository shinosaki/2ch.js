import { useEffect } from 'react'
import { cn } from '@/lib/utils'

export default function ThreadViewer({ url, comments, setComments }) {
  useEffect(() => {
    fetch(`/api/dat?url=${url}`, { cache: 'force-cache' })
      .then(r => r.json())
      .then(r => setComments(r.comments))
  }, [url])

  return (
    <ul className="divide-y">
      {comments ? comments.map(({ id, body, uid, be, name, email, date, anchor }) => (
        <li key={id} id={id} className="message p-1">
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