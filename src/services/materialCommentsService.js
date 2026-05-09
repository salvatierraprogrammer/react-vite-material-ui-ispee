import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  limit,
} from 'firebase/firestore'
import { db } from '../firebase/config'

const COLLECTION = 'materialComments'

export function subscribeComments(materialId, callback, commentLimit = 100) {
  const q = query(
    collection(db, COLLECTION),
    where('materialId', '==', materialId),
    orderBy('createdAt', 'desc'),
    limit(commentLimit)
  )
  return onSnapshot(q, (snap) => {
    const comments = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    comments.reverse()
    callback(comments)
  })
}

export async function getComments(materialId) {
  const q = query(
    collection(db, COLLECTION),
    where('materialId', '==', materialId),
    orderBy('createdAt', 'desc'),
    limit(100)
  )
  const snap = await getDocs(q)
  const comments = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  comments.reverse()
  return comments
}

export async function addComment({ materialId, userId, author, authorPhoto, comment }) {
  const ref = await addDoc(collection(db, COLLECTION), {
    materialId,
    userId,
    author,
    authorPhoto: authorPhoto || '',
    comment,
    createdAt: new Date().toISOString(),
  })
  return { id: ref.id, materialId, userId, author, authorPhoto: authorPhoto || '', comment, createdAt: new Date().toISOString() }
}

export async function updateComment(id, userId, updates) {
  const snap = await getDoc(doc(db, COLLECTION, id))
  if (!snap.exists()) throw new Error('Comentario no encontrado')
  if (snap.data().userId !== userId) throw new Error('No autorizado')
  await updateDoc(doc(db, COLLECTION, id), updates)
  const updated = await getDoc(doc(db, COLLECTION, id))
  return { id: updated.id, ...updated.data() }
}

export async function deleteComment(id, userId) {
  const snap = await getDoc(doc(db, COLLECTION, id))
  if (!snap.exists()) throw new Error('Comentario no encontrado')
  if (snap.data().userId !== userId) throw new Error('No autorizado')
  await deleteDoc(doc(db, COLLECTION, id))
  return id
}
