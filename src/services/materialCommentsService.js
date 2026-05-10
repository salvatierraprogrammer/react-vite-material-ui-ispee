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
  onSnapshot,
} from 'firebase/firestore'
import { db } from '../firebase/config'

const COLLECTION = 'materialComments'

export function subscribeComments(materialId, callback, commentLimit = 100) {
  const q = query(
    collection(db, COLLECTION),
    where('materialId', '==', materialId)
  )
  return onSnapshot(q,
    (snap) => {
      let comments = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      comments.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
      if (comments.length > commentLimit) comments = comments.slice(0, commentLimit)
      callback(comments)
    },
    (err) => {
      console.error('Error subscribing to material comments:', err)
      callback([])
    }
  )
}

export async function getComments(materialId) {
  const q = query(
    collection(db, COLLECTION),
    where('materialId', '==', materialId)
  )
  const snap = await getDocs(q)
  let comments = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  comments.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
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
