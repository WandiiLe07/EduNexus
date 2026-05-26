import { useState, useEffect } from 'react'
import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp, doc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import { MODULES } from '../lib/modules'
import PostCard from '../components/PostCard'
import styles from './Problems.module.css'

export default function Problems() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', body: '', module: '' })
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    const q = query(collection(db, 'problems'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, snap => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
  }, [])

  const filtered = filter === 'all' ? posts : filter === 'open' ? posts.filter(p => !p.solved) : posts.filter(p => p.solved)

  async function submit() {
    if (!form.title.trim() || !user) return
    setPosting(true)
    await addDoc(collection(db, 'problems'), {
      ...form, type: 'problem', solved: false,
      authorId: user.uid, authorName: user.displayName, authorPhoto: user.photoURL || null,
      votes: 0, votedBy: [], replies: [], createdAt: serverTimestamp(),
    })
    setForm({ title: '', body: '', module: '' }); setPosting(false); setShowForm(false)
  }

  async function markSolved(id) {
    await updateDoc(doc(db, 'problems', id), { solved: true })
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1>Problem board</h1>
        <button className="primary" onClick={() => setShowForm(v => !v)}>+ Post a problem</button>
      </div>

      {showForm && (
        <div className={`card ${styles.form}`}>
          <input placeholder="Summarise your problem in one line" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={{ marginBottom: 8 }} />
          <select value={form.module} onChange={e => setForm(f => ({ ...f, module: e.target.value }))} style={{ marginBottom: 8 }}>
            {MODULES.map(m => (
              <option key={m.code} value={m.code}>
                {m.code ? `${m.code} — ${m.name}` : 'All modules'}
              </option>
            ))}
          </select>
          <textarea placeholder="Describe the problem — what have you tried? What error are you getting?" value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} style={{ marginBottom: 10 }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button onClick={() => setShowForm(false)}>Cancel</button>
            <button className="primary" onClick={submit} disabled={posting || !form.title.trim()}>{posting ? '...' : 'Post problem'}</button>
          </div>
        </div>
      )}

      <div className={styles.chips}>
        {['all', 'open', 'solved'].map(f => (
          <button key={f} className={`pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading && <div className="spinner" />}
      {!loading && filtered.length === 0 && <div className="empty">No problems here — post one above</div>}
      {filtered.map(p => (
        <PostCard key={p.id} post={{ ...p, type: 'problem' }} collection="problems"
          extraMeta={
            <>
              <span className={`badge ${styles[p.solved ? 'solved' : 'open']}`}>{p.solved ? '✓ Solved' : 'Open'}</span>
              {!p.solved && p.authorId === user?.uid && (
                <button className="sm" onClick={() => markSolved(p.id)} style={{ fontSize: 11 }}>Mark solved</button>
              )}
            </>
          }
        />
      ))}
    </div>
  )
}
