import { useState, useEffect } from 'react'
import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import { MODULES } from '../lib/modules'
import PostCard from '../components/PostCard'
import styles from './Resources.module.css'

const TYPES = ['all', 'notes', 'past', 'tip']
const TYPE_LABELS = { all: 'All', notes: 'Notes', past: 'Past papers', tip: 'Exam tips' }

export default function Resources() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', body: '', type: 'notes', module: '', link: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const q = query(collection(db, 'resources'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, snap => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
  }, [])

  const filtered = filter === 'all' ? posts : posts.filter(p => p.type === filter)

  async function submit() {
    if (!form.title.trim() || !user) return
    if (!form.link.trim()) return alert('Please paste a Google Drive or OneDrive link')
    setSubmitting(true)
    try {
      await addDoc(collection(db, 'resources'), {
        ...form,
        authorId: user.uid,
        authorName: user.displayName,
        authorPhoto: user.photoURL || null,
        votes: 0,
        votedBy: [],
        replies: [],
        createdAt: serverTimestamp(),
      })
      setForm({ title: '', body: '', type: 'notes', module: '', link: '' })
      setShowForm(false)
    } catch (e) {
      console.error(e)
      alert('Failed to share resource. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1>Resources</h1>
        <button className="primary" onClick={() => setShowForm(v => !v)}>+ Share resource</button>
      </div>

      {showForm && (
        <div className={`card ${styles.form}`}>
          <div className="row" style={{ marginBottom: 8 }}>
            <input
              placeholder="Title (e.g. BSPE301 Past Paper 2024)"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div className="row" style={{ marginBottom: 8 }}>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              <option value="notes">Notes</option>
              <option value="past">Past paper</option>
              <option value="tip">Exam tips</option>
            </select>
            <select value={form.module} onChange={e => setForm(f => ({ ...f, module: e.target.value }))}>
              {MODULES.map(m => (
                <option key={m.code} value={m.code}>
                  {m.code ? `${m.code} — ${m.name}` : 'All modules'}
                </option>
              ))}
            </select>
          </div>
          <textarea
            placeholder="Describe what you're sharing..."
            value={form.body}
            onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
            style={{ marginBottom: 8 }}
          />
          <div style={{ marginBottom: 12 }}>
            <input
              placeholder="🔗 Paste a Google Drive or OneDrive link (required)"
              value={form.link}
              onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
            />
            <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6 }}>
              💡 Tip: Upload your file to Google Drive → right-click → Share → Anyone with the link → Copy link
            </p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
            <button onClick={() => setShowForm(false)}>Cancel</button>
            <button
              className="primary"
              onClick={submit}
              disabled={submitting || !form.title.trim()}
            >
              {submitting ? 'Sharing...' : 'Share'}
            </button>
          </div>
        </div>
      )}

      <div className={styles.chips}>
        {TYPES.map(t => (
          <button key={t} className={`pill ${filter === t ? 'active' : ''}`} onClick={() => setFilter(t)}>
            {TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      {loading && <div className="spinner" />}
      {!loading && filtered.length === 0 && (
        <div className="empty">No resources yet — be the first to share</div>
      )}
      {filtered.map(p => (
        <PostCard key={p.id} post={p} collection="resources">
          {p.link && (
            <a href={p.link} target="_blank" rel="noreferrer" className={styles.fileChip}>
              🔗 Open resource
            </a>
          )}
        </PostCard>
      ))}
    </div>
  )
}