import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  limit,
} from 'firebase/firestore'
import { db } from '../firebase/config'

const COLLECTION = 'notifications'

export function subscribeNotifications(userId, callback, notifLimit = 100) {
  if (!userId) { callback([]); return () => {} }
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId)
  )
  return onSnapshot(q,
    (snap) => {
      let items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
      if (items.length > notifLimit) items = items.slice(0, notifLimit)
      callback(items)
    },
    () => callback([])
  )
}

export async function getNotifications(userId, notifLimit = 100) {
  if (!userId) return []
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId)
  )
  const snap = await getDocs(q)
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
  return items.slice(0, notifLimit)
}

export async function createNotification(notif) {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...notif,
    read: false,
    createdAt: new Date().toISOString(),
  })
  return { id: ref.id, ...notif, read: false, createdAt: new Date().toISOString() }
}

export async function markAsRead(id) {
  await updateDoc(doc(db, COLLECTION, id), { read: true })
}

export async function markAllAsRead(userId) {
  if (!userId) return
  const snap = await getDocs(query(collection(db, COLLECTION), where('userId', '==', userId)))
  await Promise.all(
    snap.docs
      .filter((d) => !d.data().read)
      .map((d) => updateDoc(d.ref, { read: true }))
  )
}

export async function deleteNotification(id) {
  await deleteDoc(doc(db, COLLECTION, id))
}
