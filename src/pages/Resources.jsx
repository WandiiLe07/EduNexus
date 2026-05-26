import { useState, useEffect } from 'react'
import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../lib/firebase'
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
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

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
    setUploading(true)
    let fileURL = form.link
    let fileName = ''
    if (file) {
      const storageRef = ref(storage, `resources/${user.uid}/${Date.now()}_${file.name}`)
      const task = uploadBytesResumable(storageRef, file)
      await new Promise((res, rej) => {
        task.on('state_changed',
          snap => setProgress(Math.round(snap.bytesTransferred / snap.totalBytes * 100)),
          rej,
          async () => { fileURL = await getDownloadURL(task.snapshot.ref); res() }
        )
      })
      fileName = file.name
    }
    await addDoc(collection(db, 'resources'), {
      ...form, link: fileURL, fileName,
      authorId: user.uid, authorName: user.displayName, authorPhoto: user.photoURL || null,
      votes: 0, votedBy: [], replies: [], createdAt: serverTimestamp(),
    })
    setForm({ title: '', body: '', type: 'notes', module: '', link: '' })
    setFile(null); setProgress(0); setUploading(false); setShowForm(false)
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
            <input placeholder="Title (e.g. CLCM301 Past Paper 2024)" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
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
          <textarea placeholder="Describe what you're sharing..." value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} style={{ marginBottom: 8 }} />
          <div className={styles.fileRow}>
            <label className={styles.fileLabel}>
              📎 {file ? file.name : 'Attach a file (PDF, DOCX...)'}
              <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt" onChange={e => setFile(e.target.files[0])} hidden />
            </label>
            <span style={{ color: 'var(--text3)', fontSize: 12 }}>or</span>
            <input placeholder="Paste a link (Google Drive, OneDrive...)" value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} />
          </div>
          {uploading && progress > 0 && <div className={styles.progressBar}><div style={{ width: `${progress}%` }} /></div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
            <button onClick={() => setShowForm(false)}>Cancel</button>
            <button className="primary" onClick={submit} disabled={uploading || !form.title.trim()}>
              {uploading ? `Uploading ${progress}%` : 'Share'}
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
      {!loading && filtered.length === 0 && <div className="empty">No resources yet — be the first to share</div>}
      {filtered.map(p => (
        <PostCard key={p.id} post={p} collection="resources">
          {p.fileName && <a href={p.link} target="_blank" rel="noreferrer" className={styles.fileChip}>📄 {p.fileName}</a>}
        </PostCard>
      ))}
    </div>
  )
}
