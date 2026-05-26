import { useState, useEffect } from 'react'
import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import { MODULES, MODULES_BY_YEAR } from '../lib/modules'
import PostCard from '../components/PostCard'
import styles from './Discussions.module.css'

export default function Discussions() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modFilter, setModFilter] = useState('all')
  const [yearFilter, setYearFilter] = useState('all')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [mod, setMod] = useState('CLCM301')
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    const q = query(collection(db, 'discussions'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, snap => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
  }, [])

  // Filter by both year and module
  const filtered = posts.filter(p => {
    if (modFilter !== 'all' && p.module !== modFilter) return false
    if (yearFilter !== 'all') {
      const m = MODULES.find(x => x.code === p.module)
      if (!m || m.year !== yearFilter) return false
    }
    return true
  })

  async function submit() {
    if (!title.trim() || !user) return
    setPosting(true)
    await addDoc(collection(db, 'discussions'), {
      title: title.trim(), body: body.trim(), type: 'discuss', module: mod,
      authorId: user.uid, authorName: user.displayName, authorPhoto: user.photoURL || null,
      votes: 0, votedBy: [], replies: [], createdAt: serverTimestamp(),
    })
    setTitle(''); setBody(''); setPosting(false)
  }

  return (
    <div>
      <div className={styles.pageHeader}><h1>Discussions</h1></div>

      <div className={`card ${styles.form}`}>
        <div className="row" style={{ marginBottom: 8 }}>
          <input placeholder="Start a discussion..." value={title} onChange={e => setTitle(e.target.value)} />
          <select value={mod} onChange={e => setMod(e.target.value)} style={{ flex: '0 0 auto', width: 'auto', minWidth: 180 }}>
            {MODULES.filter(m => m.code).map(m => (
              <option key={m.code} value={m.code}>{m.code} — {m.name}</option>
            ))}
          </select>
          <button className="primary" onClick={submit} disabled={posting || !title.trim()} style={{ flex: '0 0 auto' }}>
            {posting ? '...' : 'Post'}
          </button>
        </div>
        <textarea placeholder="Optional — add more context..." value={body} onChange={e => setBody(e.target.value)} style={{ minHeight: 55 }} />
      </div>

      {/* Year filter */}
      <div className={styles.yearRow}>
        {['all', '1', '2', '3'].map(y => (
          <button key={y} className={`pill ${yearFilter === y ? 'active' : ''}`}
            onClick={() => { setYearFilter(y); setModFilter('all') }}>
            {y === 'all' ? 'All years' : `Year ${y}`}
          </button>
        ))}
      </div>

      {/* Module filter — shows modules for selected year */}
      <div className={styles.chips}>
        <button className={`pill ${modFilter === 'all' ? 'active' : ''}`} onClick={() => setModFilter('all')}>All</button>
        {(yearFilter === 'all' ? MODULES.filter(m => m.code) : MODULES_BY_YEAR[yearFilter] || []).map(m => (
          <button key={m.code} className={`pill sm ${modFilter === m.code ? 'active' : ''}`} onClick={() => setModFilter(m.code)}>
            {m.code}
          </button>
        ))}
      </div>

      {loading && <div className="spinner" />}
      {!loading && filtered.length === 0 && <div className="empty">No discussions yet — start one above</div>}
      {filtered.map(p => <PostCard key={p.id} post={p} collection="discussions" />)}
    </div>
  )
}
