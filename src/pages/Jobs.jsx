import { useState, useEffect } from 'react'
import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import { timeAgo, TypeBadge } from '../components/PostCard'
import styles from './Jobs.module.css'

const TYPE_LABELS = { ft: 'Full-time', pt: 'Part-time', int: 'Internship' }
const TYPE_STYLE = {
  ft:  { bg: 'var(--green-light)',  color: 'var(--green-dark)' },
  pt:  { bg: 'var(--amber-light)',  color: '#633806' },
  int: { bg: 'var(--purple-light)', color: '#3C3489' },
}

function JobTypeBadge({ type }) {
  const s = TYPE_STYLE[type] || TYPE_STYLE.ft
  return <span className="badge" style={{ background: s.bg, color: s.color }}>{TYPE_LABELS[type] || type}</span>
}

export default function Jobs() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ role: '', company: '', location: '', type: 'int', desc: '', link: '' })
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, snap => {
      setJobs(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
  }, [])

  const filtered = filter === 'all' ? jobs : jobs.filter(j => j.type === filter)

  async function submit() {
    if (!form.role.trim() || !form.company.trim() || !user) return
    setPosting(true)
    await addDoc(collection(db, 'jobs'), {
      ...form,
      authorId: user.uid,
      authorName: user.displayName,
      createdAt: serverTimestamp(),
    })
    setForm({ role: '', company: '', location: '', type: 'int', desc: '', link: '' })
    setPosting(false)
    setShowForm(false)
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1>Jobs &amp; internships</h1>
        <button className="primary" onClick={() => setShowForm(v => !v)}>+ Post listing</button>
      </div>

      {showForm && (
        <div className={`card ${styles.form}`}>
          <div className="row" style={{ marginBottom: 8 }}>
            <input placeholder="Role (e.g. IoT Intern)" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} />
            <input placeholder="Company" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
          </div>
          <div className="row" style={{ marginBottom: 8 }}>
            <input placeholder="Location (e.g. Durban / Remote)" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              <option value="int">Internship</option>
              <option value="ft">Full-time</option>
              <option value="pt">Part-time</option>
            </select>
          </div>
          <textarea placeholder="Describe the role, requirements, and how to apply..." value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} style={{ marginBottom: 8 }} />
          <input placeholder="Apply link (optional)" value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} style={{ marginBottom: 10 }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button onClick={() => setShowForm(false)}>Cancel</button>
            <button className="primary" onClick={submit} disabled={posting || !form.role.trim()}>
              {posting ? '...' : 'Post listing'}
            </button>
          </div>
        </div>
      )}

      <div className={styles.chips}>
        {['all', 'int', 'ft', 'pt'].map(f => (
          <button key={f} className={`pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : TYPE_LABELS[f]}
          </button>
        ))}
      </div>

      {loading && <div className="spinner" />}
      {!loading && filtered.length === 0 && <div className="empty">No listings yet — post one above</div>}

      {filtered.map(j => (
        <div key={j.id} className={`card ${styles.jobCard}`}>
          <div className={styles.companyLogo}>
            {j.company.slice(0, 3).toUpperCase()}
          </div>
          <div className={styles.jobBody}>
            <div className={styles.jobTitle}>{j.role}</div>
            <div className={styles.jobMeta}>
              <span className={styles.company}>{j.company}</span>
              {j.location && <span>📍 {j.location}</span>}
              <JobTypeBadge type={j.type} />
              <span className={styles.time}>{timeAgo(j.createdAt)}</span>
            </div>
            {j.desc && <p className={styles.desc}>{j.desc}</p>}
            {j.link && (
              <a href={j.link} target="_blank" rel="noreferrer" className={styles.applyBtn}>
                Apply ↗
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
