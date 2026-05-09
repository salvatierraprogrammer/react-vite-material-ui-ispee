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
  arrayUnion,
  arrayRemove,
  increment,
  limit,
} from 'firebase/firestore'
import { db } from '../firebase/config'

const COLLECTION = 'forumPosts'

export function subscribePosts(callback, postLimit = 50) {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'), limit(postLimit))
  return onSnapshot(q, (snap) => {
    const posts = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    callback(posts)
  })
}

export async function createPost({ userId, author, authorPhoto, content, title }) {
  const ref = await addDoc(collection(db, COLLECTION), {
    userId,
    author,
    authorPhoto: authorPhoto || '',
    title: title || '',
    content,
    likes: [],
    likesCount: 0,
    commentsCount: 0,
    createdAt: new Date().toISOString(),
  })
  return { id: ref.id, userId, author, authorPhoto: authorPhoto || '', title: title || '', content, likes: [], likesCount: 0, commentsCount: 0, createdAt: new Date().toISOString() }
}

export async function getPostById(id) {
  const snap = await getDoc(doc(db, COLLECTION, id))
  if (!snap.exists()) throw new Error('Post no encontrado')
  return { id: snap.id, ...snap.data() }
}

export async function likePost(postId, userId) {
  const ref = doc(db, COLLECTION, postId)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error('Post no encontrado')
  const data = snap.data()
  const hasLiked = (data.likes || []).includes(userId)
  if (hasLiked) {
    await updateDoc(ref, { likes: arrayRemove(userId), likesCount: Math.max(0, (data.likesCount || 1) - 1) })
  } else {
    await updateDoc(ref, { likes: arrayUnion(userId), likesCount: (data.likesCount || 0) + 1 })
  }
  return { liked: !hasLiked, likesCount: hasLiked ? Math.max(0, (data.likesCount || 1) - 1) : (data.likesCount || 0) + 1 }
}

export async function addComment(postId, comment) {
  const commentsRef = collection(db, COLLECTION, postId, 'comments')
  const ref = await addDoc(commentsRef, {
    ...comment,
    createdAt: new Date().toISOString(),
  })
  await updateDoc(doc(db, COLLECTION, postId), { commentsCount: increment(1) })
  return { id: ref.id, ...comment, createdAt: new Date().toISOString() }
}

export function subscribeComments(postId, callback, commentLimit = 100) {
  const q = query(collection(db, COLLECTION, postId, 'comments'), orderBy('createdAt', 'desc'), limit(commentLimit))
  return onSnapshot(q, (snap) => {
    const comments = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    comments.reverse()
    callback(comments)
  })
}

export async function updatePost(id, userId, updates) {
  const snap = await getDoc(doc(db, COLLECTION, id))
  if (!snap.exists()) throw new Error('Post no encontrado')
  if (snap.data().userId !== userId) throw new Error('No autorizado')
  await updateDoc(doc(db, COLLECTION, id), updates)
  const updated = await getDoc(doc(db, COLLECTION, id))
  return { id: updated.id, ...updated.data() }
}

export async function deletePost(id, userId) {
  const snap = await getDoc(doc(db, COLLECTION, id))
  if (!snap.exists()) throw new Error('Post no encontrado')
  if (snap.data().userId !== userId) throw new Error('No autorizado')

  const commentsSnap = await getDocs(collection(db, COLLECTION, id, 'comments'))
  await Promise.all(commentsSnap.docs.map((d) => deleteDoc(d.ref)))

  await deleteDoc(doc(db, COLLECTION, id))
  return id
}

export async function deleteComment(postId, commentId, userId) {
  const ref = doc(db, COLLECTION, postId, 'comments', commentId)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error('Comentario no encontrado')
  if (snap.data().userId !== userId) throw new Error('No autorizado')
  await deleteDoc(ref)
  await updateDoc(doc(db, COLLECTION, postId), { commentsCount: increment(-1) })
  return commentId
}
