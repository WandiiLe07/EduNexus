import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider } from '../lib/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await saveUserToFirestore(firebaseUser)
        setUser(firebaseUser)
      } else {
        setUser(null)
      }
    })
    return unsub
  }, [])

  async function saveUserToFirestore(firebaseUser) {
    try {
      const ref = doc(db, 'users', firebaseUser.uid)
      const snap = await getDoc(ref)
      if (!snap.exists()) {
        await setDoc(ref, {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          photo: firebaseUser.photoURL,
          bio: '',
          faculty: 'ICT',
          year: '3rd Year',
          createdAt: serverTimestamp(),
        })
      }
    } catch (e) {
      console.error('Firestore error:', e)
    }
  }

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (e) {
      console.error('Sign in error:', e)
    }
  }

  const logout = () => signOut(auth)

  return (
    <AuthContext.Provider value={{ user, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)