import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyDwjodEuyEYqiwKR4daa81WWzIFRZLtG0A",
  authDomain: "iconnect-dut.firebaseapp.com",
  projectId: "iconnect-dut",
  storageBucket: "iconnect-dut.firebasestorage.app",
  messagingSenderId: "450257969300",
  appId: "1:450257969300:web:d79f6b04ee7e6cc56b1481"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const googleProvider = new GoogleAuthProvider()