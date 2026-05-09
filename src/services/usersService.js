import { collection, getDocs, getDoc, doc, query, where, limit, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { db } from '../firebase/config'

const COLLECTION = 'users'

export async function searchUsers(searchTerm) {
  if (!searchTerm?.trim()) return []
  const term = searchTerm.toLowerCase().trim()

  try {
    const nameQ = query(collection(db, COLLECTION), where('name', '>=', term), where('name', '<=', term + '\uf8ff'), limit(10))
    const lastNameQ = query(collection(db, COLLECTION), where('lastName', '>=', term), where('lastName', '<=', term + '\uf8ff'), limit(10))
    const emailQ = query(collection(db, COLLECTION), where('email', '>=', term), where('email', '<=', term + '\uf8ff'), limit(10))

    const [nameSnap, lastNameSnap, emailSnap] = await Promise.all([
      getDocs(nameQ),
      getDocs(lastNameQ),
      getDocs(emailQ),
    ])

    const map = new Map()
    ;[...nameSnap.docs, ...lastNameSnap.docs, ...emailSnap.docs].forEach((d) => {
      if (!map.has(d.id)) map.set(d.id, { id: d.id, ...d.data() })
    })

    if (map.size > 0) return Array.from(map.values()).slice(0, 10)
  } catch {
  }

  const allSnap = await getDocs(collection(db, COLLECTION))
  const results = allSnap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((u) => {
      const name = (u.name || '').toLowerCase()
      const lastName = (u.lastName || '').toLowerCase()
      const email = (u.email || '').toLowerCase()
      return name.includes(term) || lastName.includes(term) || email.includes(term)
    })
  return results.slice(0, 10)
}

export async function getUserById(uid) {
  const snap = await getDoc(doc(db, COLLECTION, uid))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

export async function updateUserProfile(uid, data) {
  const ref = doc(db, COLLECTION, uid)
  await updateDoc(ref, data)
  const snap = await getDoc(ref)
  return { id: snap.id, ...snap.data() }
}

export async function getUserFavorites(uid) {
  const snap = await getDoc(doc(db, COLLECTION, uid))
  return snap.data()?.favorites || []
}

export async function toggleUserFavorite(uid, materialId) {
  const ref = doc(db, COLLECTION, uid)
  const snap = await getDoc(ref)
  const favs = snap.data()?.favorites || []
  if (favs.includes(materialId)) {
    await updateDoc(ref, { favorites: arrayRemove(materialId) })
  } else {
    await updateDoc(ref, { favorites: arrayUnion(materialId) })
  }
}
