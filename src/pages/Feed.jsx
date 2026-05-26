import { useState, useEffect } from 'react'
import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import { MODULES } from '../lib/modules'
import PostCard from '../components/PostCard'
import styles from './Feed.module.css'

export default function Feed() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [body, setBody] = useState('')
  const [type, setType] = useState('discuss')
  const [mod, setMod] = useState('')
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, snap => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [])

  async function post() {
    if (!body.trim() || !user) return
    setPosting(true)
    await addDoc(collection(db, 'posts'), {
      title: body.trim().slice(0, 80),
      body: body.trim(),
      type,
      module: mod,
      authorId: user.uid,
      authorName: user.displayName,
      authorPhoto: user.photoURL || null,
      votes: 0,
      votedBy: [],
      replies: [],
      createdAt: serverTimestamp(),
    })
    setBody('')
    setPosting(false)
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1>Feed</h1>
      </div>

      <div className={`card ${styles.compose}`}>
        <textarea
          placeholder="Share something with the EduNexus community..."
          value={body}
          onChange={e => setBody(e.target.value)}
        />
        <div className={styles.composeRow}>
          <select value={type} onChange={e => setType(e.target.value)}>
            <option value="discuss">Discussion</option>
            <option value="tip">Exam tip</option>
            <option value="notes">Notes</option>
            <option value="problem">Problem</option>
          </select>
          <select value={mod} onChange={e => setMod(e.target.value)}>
            {MODULES.map(m => (
              <option key={m.code} value={m.code}>
                {m.code ? `${m.code} — ${m.name}` : 'All modules'}
              </option>
            ))}
          </select>
          <button className="primary" onClick={post} disabled={posting || !body.trim()}>
            {posting ? '...' : '↑ Post'}
          </button>
        </div>
      </div>

      {loading && <div className="spinner" />}
      {!loading && posts.length === 0 && (
        <div className="empty">No posts yet — be the first to share something</div>
      )}
      {posts.map(p => (
        <PostCard key={p.id} post={p} collection="posts" />
      ))}
    </div>
  )
}
