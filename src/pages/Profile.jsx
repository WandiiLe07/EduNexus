import { useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import { Avatar } from '../components/Layout'
import styles from './Profile.module.css'

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgrad']
const FACULTIES = ['ICT', 'Engineering', 'Science', 'Business', 'Other']

export default function Profile() {
  const { user, logout } = useAuth()
  const [name, setName] = useState(user?.displayName || '')
  const [bio, setBio] = useState(user?.profile?.bio || '')
  const [year, setYear] = useState(user?.profile?.year || '3rd Year')
  const [faculty, setFaculty] = useState(user?.profile?.faculty || 'ICT')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save() {
    if (!user) return
    setSaving(true)
    await updateDoc(doc(db, 'users', user.uid), { bio, year, faculty })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1>Profile</h1>
      </div>

      <div className={`card ${styles.profileCard}`}>
        <div className={styles.avatarRow}>
          <Avatar user={user} size={64} />
          <div>
            <div className={styles.displayName}>{user?.displayName}</div>
            <div className={styles.email}>{user?.email}</div>
          </div>
        </div>

        <div className={styles.field}>
          <label>Bio</label>
          <textarea
            placeholder="Tell your classmates a bit about yourself..."
            value={bio}
            onChange={e => setBio(e.target.value)}
            style={{ minHeight: 70 }}
          />
        </div>

        <div className="row" style={{ marginBottom: 16 }}>
          <div className={styles.field} style={{ flex: 1 }}>
            <label>Year of study</label>
            <select value={year} onChange={e => setYear(e.target.value)}>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className={styles.field} style={{ flex: 1 }}>
            <label>Faculty</label>
            <select value={faculty} onChange={e => setFaculty(e.target.value)}>
              {FACULTIES.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="primary" onClick={save} disabled={saving}>
            {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save profile'}
          </button>
          <button className="danger" onClick={logout}>Sign out</button>
        </div>
      </div>

      <div className={`card ${styles.infoCard}`}>
        <div className={styles.infoTitle}>Firebase security rules</div>
        <p className={styles.infoText}>
          Before sharing EduNexus with classmates, set up Firestore security rules so only authenticated users can post. See the README for the recommended rules.
        </p>
      </div>
    </div>
  )
}
