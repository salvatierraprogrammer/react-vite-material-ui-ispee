import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  startAfter,
} from 'firebase/firestore'
import { db } from '../firebase/config'

const CONV_COLLECTION = 'conversations'

function formatParticipant(user) {
  return { uid: user.uid, name: user.name || '', photoURL: user.photoURL || '' }
}

export async function getOrCreateConversation(currentUser, otherUser) {
  const currentUid = currentUser.uid
  const otherUid = otherUser.uid

  const q = query(
    collection(db, CONV_COLLECTION),
    where('users', 'array-contains', currentUid)
  )
  const snap = await getDocs(q)
  const existing = snap.docs.find((d) => d.data().users?.includes(otherUid))

  if (existing) {
    return { id: existing.id, ...existing.data() }
  }

  const ref = await addDoc(collection(db, CONV_COLLECTION), {
    users: [currentUid, otherUid],
    participants: [formatParticipant(currentUser), formatParticipant(otherUser)],
    lastMessage: '',
    lastMessageAt: new Date().toISOString(),
    lastMessageBy: '',
    createdAt: new Date().toISOString(),
    lastRead: {},
  })

  return {
    id: ref.id,
    users: [currentUid, otherUid],
    participants: [formatParticipant(currentUser), formatParticipant(otherUser)],
    lastMessage: '',
    lastMessageAt: new Date().toISOString(),
    lastMessageBy: '',
    createdAt: new Date().toISOString(),
    lastRead: {},
  }
}

export async function sendMessage(conversationId, senderId, text) {
  const msgRef = await addDoc(
    collection(db, CONV_COLLECTION, conversationId, 'messages'),
    {
      senderId,
      text,
      createdAt: new Date().toISOString(),
      read: false,
    }
  )

  await updateDoc(doc(db, CONV_COLLECTION, conversationId), {
    lastMessage: text,
    lastMessageAt: new Date().toISOString(),
    lastMessageBy: senderId,
  })

  return {
    id: msgRef.id,
    senderId,
    text,
    createdAt: new Date().toISOString(),
    read: false,
  }
}

export function subscribeMessages(conversationId, callback, msgLimit = 100) {
  const q = query(
    collection(db, CONV_COLLECTION, conversationId, 'messages'),
    orderBy('createdAt', 'desc'),
    limit(msgLimit)
  )
  return onSnapshot(q,
    (snap) => {
      const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      msgs.reverse()
      callback(msgs)
    },
    () => callback([])
  )
}

export async function getMessages(conversationId, oldestCreatedAt, msgLimit = 100) {
  let q
  if (oldestCreatedAt) {
    q = query(
      collection(db, CONV_COLLECTION, conversationId, 'messages'),
      orderBy('createdAt', 'desc'),
      startAfter(oldestCreatedAt),
      limit(msgLimit)
    )
  } else {
    q = query(
      collection(db, CONV_COLLECTION, conversationId, 'messages'),
      orderBy('createdAt', 'desc'),
      limit(msgLimit)
    )
  }
  const snap = await getDocs(q)
  const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  msgs.reverse()
  return msgs
}

export function subscribeConversations(userId, callback) {
  const q = query(
    collection(db, CONV_COLLECTION),
    where('users', 'array-contains', userId)
  )
  return onSnapshot(q,
    (snap) => {
      const convs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      convs.sort((a, b) => {
        if (!a.lastMessageAt) return 1
        if (!b.lastMessageAt) return -1
        return b.lastMessageAt.localeCompare(a.lastMessageAt)
      })
      callback(convs)
    },
    () => callback([])
  )
}

export async function markConversationRead(conversationId, userId) {
  try {
    await updateDoc(doc(db, CONV_COLLECTION, conversationId), {
      [`lastRead.${userId}`]: new Date().toISOString(),
    })
  } catch {}
}

export async function getConversation(conversationId) {
  const snap = await getDoc(doc(db, CONV_COLLECTION, conversationId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}
