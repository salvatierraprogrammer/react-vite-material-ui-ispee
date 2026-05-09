import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/config'

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback)
}

export async function registerUser({ email, password, name, lastName }) {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(cred.user, { displayName: `${name} ${lastName || ''}`.trim() })
  await setDoc(doc(db, 'users', cred.user.uid), {
    uid: cred.user.uid,
    name,
    lastName: lastName || '',
    displayName: `${name} ${lastName || ''}`.trim(),
    email,
    photoURL: '',
    photoPath: '',
    role: 'Estudiante',
    online: false,
    lastSeen: null,
    favorites: [],
    createdAt: new Date().toISOString(),
  })
  return cred.user
}

export async function loginUser({ email, password }) {
  const cred = await signInWithEmailAndPassword(auth, email, password)
  return cred.user
}

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider()
  const cred = await signInWithPopup(auth, provider)
  const snap = await getDoc(doc(db, 'users', cred.user.uid))
  if (!snap.exists()) {
    await setDoc(doc(db, 'users', cred.user.uid), {
      uid: cred.user.uid,
      name: cred.user.displayName || 'Usuario',
      lastName: '',
      displayName: cred.user.displayName || 'Usuario',
      email: cred.user.email,
      photoURL: cred.user.photoURL || '',
      photoPath: '',
      role: 'Estudiante',
      online: false,
      lastSeen: null,
      favorites: [],
      createdAt: new Date().toISOString(),
    })
  }
  return cred.user
}

export async function logoutUser() {
  await signOut(auth)
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  if (snap.exists()) return snap.data()
  return null
}

export async function sendVerificationEmail(user) {
  await sendEmailVerification(user, { url: window.location.origin })
}

export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email, { url: window.location.origin + '/login' })
}
