import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { doc, updateDoc, arrayUnion, increment } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import { Avatar } from './Layout'
import styles from './PostCard.module.css'

const MODULE_COLORS = {
  CLCM301: '#1D9E75', BSPE301: '#378ADD', ITDA301: '#7F77DD',
  ITRS301: '#D4537E', PRPD201: '#BA7517',
}
const TYPE_STYLE = {
  notes:   { bg: 'var(--blue-light)',   color: '#0C447C' },
  past:    { bg: 'var(--purple-light)', color: '#3C3489' },
  tip:     { bg: 'var(--green-light)',  color: 'var(--green-dark)' },
  problem: { bg: 'var(--coral-light)',  color: '#712B13' },
  discuss: { bg: 'var(--pink-light)',   color: '#72243E' },
  job:     { bg: 'var(--amber-light)',  color: '#633806' },
}
const TYPE_LABELS = {
  notes: 'Notes', past: 'Past paper', tip: 'Exam tip',
  problem: 'Problem', discuss: 'Discussion', job: 'Job',
}

export function ModuleBadge({ mod }) {
  if (!mod) return null
  const color = MODULE_COLORS[mod] || '#888'
  return (
    <span className="badge" style={{ background: color + '22', color }}>
      {mod}
    </span>
  )
}

export function TypeBadge({ type }) {
  const s = TYPE_STYLE[type] || TYPE_STYLE.discuss
  return (
    <span className="badge" style={{ background: s.bg, color: s.color }}>
      {TYPE_LABELS[type] || type}
    </span>
  )
}

export function timeAgo(ts) {
  if (!ts) return ''
  const date = ts.toDate ? ts.toDate() : new Date(ts)
  return formatDistanceToNow(date, { addSuffix: true })
}

export default function PostCard({ post, collection, children, extraMeta }) {
  const { user } = useAuth()
  const [showReply, setShowReply] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const hasVoted = post.votedBy?.includes(user?.uid)

  async function vote() {
    if (!user || hasVoted) return
    await updateDoc(doc(db, collection, post.id), {
      votes: increment(1),
      votedBy: arrayUnion(user.uid),
    })
  }

  async function submitReply() {
    if (!replyText.trim() || !user) return
    setSubmitting(true)
    await updateDoc(doc(db, collection, post.id), {
      replies: arrayUnion({
        uid: user.uid,
        name: user.displayName,
        photo: user.photoURL || null,
        body: replyText.trim(),
        createdAt: new Date().toISOString(),
      }),
    })
    setReplyText('')
    setShowReply(false)
    setSubmitting(false)
  }

  return (
    <div className={`card ${styles.post}`}>
      <div className={styles.meta}>
        <Avatar user={{ displayName: post.authorName, photoURL: post.authorPhoto }} size={28} />
        <span className={styles.authorName}>{post.authorName}</span>
        <span className={styles.time}>{timeAgo(post.createdAt)}</span>
        <TypeBadge type={post.type} />
        <ModuleBadge mod={post.module} />
        {extraMeta}
      </div>

      <div className={styles.title}>{post.title}</div>
      {post.body && <div className={styles.body}>{post.body}</div>}
      {post.link && (
        <a href={post.link} target="_blank" rel="noreferrer" className={styles.link}>
          ↗ Open resource
        </a>
      )}

      {children}

      <div className={styles.actions}>
        <button
          className={`sm ${hasVoted ? styles.voted : ''}`}
          onClick={vote}
          title={hasVoted ? 'Already upvoted' : 'Upvote'}
        >
          ▲ {post.votes || 0}
        </button>
        <button className="sm" onClick={() => setShowReply(v => !v)}>
          💬 {post.replies?.length || 0} {post.replies?.length === 1 ? 'reply' : 'replies'}
        </button>
      </div>

      {(showReply || post.replies?.length > 0) && (
        <div className={styles.replies}>
          {post.replies?.map((r, i) => (
            <div key={i} className={styles.reply}>
              <Avatar user={{ displayName: r.name, photoURL: r.photo }} size={22} />
              <div>
                <span className={styles.replyAuthor}>{r.name}</span>
                <span className={styles.replyBody}>{r.body}</span>
              </div>
            </div>
          ))}
          {showReply && (
            <div className={styles.replyForm}>
              <input
                placeholder="Write a reply..."
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submitReply()}
              />
              <button className="primary sm" onClick={submitReply} disabled={submitting}>
                {submitting ? '...' : 'Send'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
