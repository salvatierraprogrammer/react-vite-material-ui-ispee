import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  getDoc,
} from 'firebase/firestore'
import { db } from '../firebase/config'

const COLLECTION = 'materialRatings'

export async function rateMaterial(materialId, userId, rating) {
  const existingQ = query(
    collection(db, COLLECTION),
    where('materialId', '==', materialId),
    where('userId', '==', userId)
  )
  const existingSnap = await getDocs(existingQ)

  if (existingSnap.empty) {
    await addDoc(collection(db, COLLECTION), {
      materialId,
      userId,
      rating,
      createdAt: new Date().toISOString(),
    })
  } else {
    await updateDoc(existingSnap.docs[0].ref, { rating })
  }

  const allSnap = await getDocs(
    query(collection(db, COLLECTION), where('materialId', '==', materialId))
  )
  const total = allSnap.docs.reduce((sum, d) => sum + d.data().rating, 0)
  const count = allSnap.docs.length
  const avg = count > 0 ? Math.round((total / count) * 10) / 10 : 0

  await updateDoc(doc(db, 'materials', materialId), {
    averageRating: avg,
    ratingsCount: count,
  })

  return { averageRating: avg, ratingsCount: count }
}

export async function getUserRating(materialId, userId) {
  const q = query(
    collection(db, COLLECTION),
    where('materialId', '==', materialId),
    where('userId', '==', userId)
  )
  const snap = await getDocs(q)
  if (snap.empty) return null
  return { id: snap.docs[0].id, ...snap.docs[0].data() }
}

export async function getAverageRating(materialId) {
  const snap = await getDocs(
    query(collection(db, COLLECTION), where('materialId', '==', materialId))
  )
  if (snap.empty) return { averageRating: 0, ratingsCount: 0 }
  const total = snap.docs.reduce((sum, d) => sum + d.data().rating, 0)
  return {
    averageRating: Math.round((total / snap.docs.length) * 10) / 10,
    ratingsCount: snap.docs.length,
  }
}
