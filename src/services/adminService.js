import {
  collection, doc, getDocs, getDoc, updateDoc, deleteDoc, addDoc, setDoc,
  query, orderBy, limit, where, onSnapshot, serverTimestamp, increment,
  Timestamp, writeBatch, collectionGroup,
} from 'firebase/firestore'
import { ref, listAll, getMetadata, deleteObject, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../firebase/config'
import { ROLES } from './authService'
import { createNotification } from './notificationService'

async function listAllRecursive(dirRef) {
  const items = []
  try {
    const result = await listAll(dirRef)
    items.push(...result.items)
    for (const prefix of result.prefixes) {
      const subItems = await listAllRecursive(prefix)
      items.push(...subItems)
    }
  } catch {}
  return items
}

const AUDIT_COLLECTION = 'adminLogs'
const SANCTIONS_COLLECTION = 'sanctions'
const REPORTS_COLLECTION = 'reports'

export async function auditLog(action, details, adminId) {
  try {
    await addDoc(collection(db, AUDIT_COLLECTION), {
      action,
      details,
      adminId,
      createdAt: serverTimestamp(),
    })
  } catch {}
}

export const getAllUsers = async () => {
  const snap = await getDocs(collection(db, 'users'))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const getUserById = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

export const getUserUploadsCount = async (uid) => {
  const q = query(collection(db, 'materials'), where('userId', '==', uid))
  const snap = await getDocs(q)
  return snap.size
}

export const getUsersWithUploadsCount = async (users) => {
  const counts = {}
  const q = query(collection(db, 'materials'))
  const snap = await getDocs(q)
  snap.docs.forEach((d) => {
    const uid = d.data().userId
    if (uid) counts[uid] = (counts[uid] || 0) + 1
  })
  return users.map((u) => ({ ...u, uploadsCount: counts[u.id] || 0 }))
}

export const updateUserRole = async (uid, newRole, adminId) => {
  const validRoles = Object.values(ROLES)
  if (!validRoles.includes(newRole)) throw new Error('Rol inválido')
  const user = await getUserById(uid)
  if (!user) throw new Error('Usuario no encontrado')
  const oldRole = user.role
  await updateDoc(doc(db, 'users', uid), { role: newRole })
  await auditLog('role_change', { uid, oldRole, newRole, email: user.email }, adminId)
}

export const blockUser = async (uid, adminId) => {
  const user = await getUserById(uid)
  await updateDoc(doc(db, 'users', uid), { isBlocked: true })
  await auditLog('user_blocked', { uid, email: user?.email, displayName: user?.displayName }, adminId)
  if (uid) {
    createNotification({ userId: uid, text: 'Tu cuenta ha sido bloqueada por un administrador.', type: 'sanction' }).catch(() => {})
  }
}

export const unblockUser = async (uid, adminId) => {
  await updateDoc(doc(db, 'users', uid), {
    isBlocked: false, suspended: false, suspensionReason: '', suspensionDate: null,
  })
  await auditLog('user_unblocked', { uid }, adminId)
}

export const warnUser = async (uid, reason, adminId) => {
  const user = await getUserById(uid)
  await updateDoc(doc(db, 'users', uid), { warnings: increment(1) })
  await addDoc(collection(db, SANCTIONS_COLLECTION), {
    userId: uid,
    reason: reason || 'Advertencia general',
    type: 'warning',
    createdBy: adminId,
    email: user?.email,
    displayName: user?.displayName || user?.name,
    createdAt: serverTimestamp(),
  })
  await auditLog('user_warned', { uid, reason, email: user?.email, displayName: user?.displayName || user?.name }, adminId)
  const warningCount = (user?.warnings || 0) + 1
  if (warningCount >= 3) {
    await updateDoc(doc(db, 'users', uid), { isBlocked: true, blockedForWarnings: true })
  }
  if (uid) {
    const text = warningCount >= 3
      ? 'Has llegado al límite de 3 advertencias. Tu cuenta ha sido bloqueada. Contactate con soporte para quitar el bloqueo ya que no cumpliste con tu conducta.'
      : `Has recibido una advertencia${reason ? `: ${reason}` : ''}. Te quedan ${3 - warningCount} advertencia(s) antes de un bloqueo.`
    createNotification({ userId: uid, text, type: 'sanction' }).catch(() => {})
  }
}

export const suspendUser = async (uid, reason, adminId) => {
  const user = await getUserById(uid)
  await updateDoc(doc(db, 'users', uid), {
    suspended: true,
    suspensionReason: reason || 'Sin motivo especificado',
    suspensionDate: serverTimestamp(),
    isBlocked: true,
  })
  await addDoc(collection(db, SANCTIONS_COLLECTION), {
    userId: uid,
    reason: reason || 'Sin motivo especificado',
    type: 'suspension',
    createdBy: adminId,
    email: user?.email,
    displayName: user?.displayName,
    createdAt: serverTimestamp(),
  })
  await auditLog('user_suspended', { uid, reason, email: user?.email }, adminId)
  if (uid) {
    createNotification({
      userId: uid,
      text: `Tu cuenta ha sido suspendida${reason ? `: ${reason}` : ''}. No podrás acceder hasta que un administrador la reactive.`,
      type: 'sanction',
    }).catch(() => {})
  }
}

export const toggleUserUpload = async (uid, canUpload, adminId) => {
  const user = await getUserById(uid)
  await updateDoc(doc(db, 'users', uid), { canUpload })
  await auditLog(canUpload ? 'upload_enabled' : 'upload_disabled', { uid, email: user?.email }, adminId)
}

export const deleteUserAccount = async (uid, adminId) => {
  const user = await getUserById(uid)
  await auditLog('user_deleted', { uid, email: user?.email, displayName: user?.displayName }, adminId)
  await deleteDoc(doc(db, 'users', uid))
}

export const getAllMaterials = async () => {
  const snap = await getDocs(collection(db, 'materials'))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const toggleHideMaterial = async (id, hidden, adminId) => {
  const snap = await getDoc(doc(db, 'materials', id))
  const data = snap.data()
  await updateDoc(doc(db, 'materials', id), { hidden })
  await auditLog(hidden ? 'material_hidden' : 'material_unhidden', { materialId: id, title: data?.title }, adminId)
}

export const deleteMaterialWithFiles = async (id, adminId) => {
  const snap = await getDoc(doc(db, 'materials', id))
  if (snap.exists()) {
    const data = snap.data()
    if (data.filePath) {
      try {
        const storageRef = ref(storage, data.filePath)
        await deleteObject(storageRef)
      } catch {}
    }
  }
  await deleteDoc(doc(db, 'materials', id))
  await auditLog('material_deleted', { materialId: id, title: snap.data()?.title }, adminId)
}

export const getAllForumPosts = async () => {
  const snap = await getDocs(collection(db, 'forumPosts'))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const deleteForumPost = async (id, adminId) => {
  const snap = await getDoc(doc(db, 'forumPosts', id))
  await deleteDoc(doc(db, 'forumPosts', id))
  await auditLog('forum_post_deleted', { postId: id, title: snap.data()?.title }, adminId)
}

export const getAllComments = async (fromCollection = 'materialComments') => {
  const snap = await getDocs(collection(db, fromCollection))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const deleteComment = async (id, adminId) => {
  await deleteDoc(doc(db, 'materialComments', id))
  await auditLog('comment_deleted', { commentId: id }, adminId)
}

export const getAllForumSubcollectionComments = async () => {
  const snap = await getDocs(collectionGroup(db, 'comments'))
  const comments = []
  for (const d of snap.docs) {
    const data = d.data()
    const parts = d.ref.path.split('/')
    const postId = parts[1]
    comments.push({
      id: d.id,
      postId,
      userId: data.userId || null,
      author: data.author || 'Desconocido',
      authorPhoto: data.authorPhoto || '',
      content: data.content || '',
      createdAt: data.createdAt || null,
      _commentType: 'forum',
    })
  }
  comments.sort((a, b) => {
    const ta = a.createdAt
      ? (a.createdAt.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime())
      : 0
    const tb = b.createdAt
      ? (b.createdAt.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime())
      : 0
    return tb - ta
  })
  return comments
}

export const deleteForumComment = async (postId, commentId, adminId) => {
  await deleteDoc(doc(db, 'forumPosts', postId, 'comments', commentId))
  await updateDoc(doc(db, 'forumPosts', postId), { commentsCount: increment(-1) })
  await auditLog('forum_comment_deleted', { postId, commentId }, adminId)
}

const userCache = new Map()

async function resolveUserName(uid) {
  if (!uid || uid === 'unknown') return 'Desconocido'
  if (userCache.has(uid)) return userCache.get(uid)
  try {
    const snap = await getDoc(doc(db, 'users', uid))
    if (snap.exists()) {
      const d = snap.data()
      const name = d.displayName || d.name || d.email || uid
      userCache.set(uid, name)
      return name
    }
  } catch {}
  userCache.set(uid, uid)
  return uid
}

export const getStorageStats = async () => {
  try {
    let totalSize = 0
    const files = []

    try {
      const allItems = await listAllRecursive(ref(storage))
      const userIds = new Set()
      const itemMap = []

      for (const itemRef of allItems) {
        try {
          const meta = await getMetadata(itemRef)
          const parts = itemRef.fullPath.split('/')
          const ownerId = parts.length >= 2 ? parts[1] : 'unknown'
          userIds.add(ownerId)
          itemMap.push({ itemRef, meta, ownerId })
        } catch {}
      }

      for (const uid of userIds) {
        await resolveUserName(uid)
      }

      for (const { itemRef, meta, ownerId } of itemMap) {
        totalSize += meta.size || 0
        files.push({
          name: itemRef.name,
          fullPath: itemRef.fullPath,
          size: meta.size || 0,
          contentType: meta.contentType || 'unknown',
          updated: meta.updated || null,
          timeCreated: meta.timeCreated || null,
          ownerId,
          userName: resolveUserName(ownerId),
        })
      }

      for (const f of files) {
        if (typeof f.userName === 'object') {
          f.userName = await f.userName
        }
      }
    } catch {}

    const FREE_STORAGE_LIMIT = 5 * 1024 * 1024 * 1024
    const BILLING_WARN = 4.5 * 1024 * 1024 * 1024
    return {
      totalSize,
      fileCount: files.length,
      files: files.sort((a, b) => (b.size || 0) - (a.size || 0)),
      limit: FREE_STORAGE_LIMIT,
      percentage: Math.min((totalSize / FREE_STORAGE_LIMIT) * 100, 100),
      isNearLimit: totalSize >= FREE_STORAGE_LIMIT * 0.9,
      isCritical: totalSize >= FREE_STORAGE_LIMIT * 0.95,
      isBillingWarning: totalSize >= BILLING_WARN,
      billingThreshold: BILLING_WARN,
    }
  } catch (error) {
    return {
      totalSize: 0, fileCount: 0, files: [],
      limit: 5 * 1024 * 1024 * 1024, percentage: 0,
      isNearLimit: false, isCritical: false, isBillingWarning: false,
      billingThreshold: 4.5 * 1024 * 1024 * 1024, error: error.message,
    }
  }
}

export const getTopStorageUsers = async () => {
  const materialsSnap = await getDocs(collection(db, 'materials'))
  const userSizes = {}
  for (const d of materialsSnap.docs) {
    const m = d.data()
    if (m.userId && m.fileSize) {
      userSizes[m.userId] = (userSizes[m.userId] || 0) + m.fileSize
    }
  }
  const userIds = Object.keys(userSizes).sort((a, b) => userSizes[b] - userSizes[a]).slice(0, 10)
  const result = []
  for (const uid of userIds) {
    const snap = await getDoc(doc(db, 'users', uid))
    result.push({
      uid,
      name: snap.exists() ? (snap.data().displayName || snap.data().name || 'Unknown') : 'Unknown',
      totalSize: userSizes[uid],
    })
  }
  return result
}

export const deleteStorageFile = async (filePath, adminId) => {
  const fileRef = ref(storage, filePath)
  await deleteObject(fileRef)
  await auditLog('storage_file_deleted', { filePath }, adminId)
}

export const getStats = async () => {
  const [usersSnap, materialsSnap, postsSnap, commentsSnap] = await Promise.all([
    getDocs(collection(db, 'users')),
    getDocs(collection(db, 'materials')),
    getDocs(collection(db, 'forumPosts')),
    getDocs(collection(db, 'materialComments')),
  ])

  const users = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() }))

  return {
    totalUsers: usersSnap.size,
    totalMaterials: materialsSnap.size,
    totalPosts: postsSnap.size,
    totalComments: commentsSnap.size,
    blockedUsers: users.filter((u) => u.isBlocked || u.suspended).length,
    warnedUsers: users.filter((u) => (u.warnings || 0) > 0).length,
    admins: users.filter((u) => u.role === ROLES.ADMIN).length,
    moderators: users.filter((u) => u.role === ROLES.MODERADOR).length,
    professors: users.filter((u) => u.role === ROLES.PROFESOR).length,
    students: users.filter((u) => u.role === ROLES.ESTUDIANTE).length,
    onlineUsers: users.filter((u) => u.online).length,
  }
}

export const subscribeToUsers = (callback) => {
  const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(1000))
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
}

export const subscribeToMaterials = (callback) => {
  const q = query(collection(db, 'materials'), orderBy('createdAt', 'desc'), limit(500))
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
}

export const subscribeToStats = (callback) => {
  const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
    const users = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    callback({
      totalUsers: snap.size,
      blockedUsers: users.filter((u) => u.isBlocked || u.suspended).length,
      warnedUsers: users.filter((u) => (u.warnings || 0) > 0).length,
      admins: users.filter((u) => u.role === ROLES.ADMIN).length,
      moderators: users.filter((u) => u.role === ROLES.MODERADOR).length,
      professors: users.filter((u) => u.role === ROLES.PROFESOR).length,
      students: users.filter((u) => u.role === ROLES.ESTUDIANTE).length,
      onlineUsers: users.filter((u) => u.online).length,
    })
  })

  const unsubMaterials = onSnapshot(collection(db, 'materials'), (snap) => {
    callback({ totalMaterials: snap.size })
  })

  const unsubPosts = onSnapshot(collection(db, 'forumPosts'), (snap) => {
    callback({ totalPosts: snap.size })
  })

  const unsubComments = onSnapshot(collection(db, 'materialComments'), (snap) => {
    callback({ totalComments: snap.size })
  })

  return () => {
    unsubUsers()
    unsubMaterials()
    unsubPosts()
    unsubComments()
  }
}

export const subscribeToMaterialComments = (callback) => {
  const q = query(collection(db, 'materialComments'), orderBy('createdAt', 'desc'), limit(200))
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
}

export const searchUsersFirestore = async (searchTerm, maxResults = 50) => {
  if (!searchTerm) return getAllUsers()
  const snap = await getDocs(collection(db, 'users'))
  const q = searchTerm.toLowerCase()
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((u) =>
      (u.name || '').toLowerCase().includes(q) ||
      (u.lastName || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.displayName || '').toLowerCase().includes(q)
    )
    .slice(0, maxResults)
}

export const getAuditLogs = async (maxResults = 100) => {
  const q = query(collection(db, AUDIT_COLLECTION), orderBy('createdAt', 'desc'), limit(maxResults))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const subscribeToAuditLogs = (callback, maxResults = 50) => {
  const q = query(collection(db, AUDIT_COLLECTION), orderBy('createdAt', 'desc'), limit(maxResults))
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data(), _id: d.id })))
  })
}

export const deleteAuditLog = async (logId, adminId) => {
  await deleteDoc(doc(db, AUDIT_COLLECTION, logId))
  await auditLog('audit_log_deleted', { logId }, adminId)
}

export const getSanctions = async (maxResults = 100) => {
  const q = query(collection(db, SANCTIONS_COLLECTION), orderBy('createdAt', 'desc'), limit(maxResults))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const subscribeToSanctions = (callback) => {
  const q = query(collection(db, SANCTIONS_COLLECTION), orderBy('createdAt', 'desc'), limit(100))
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
}

export const deleteSanction = async (sanctionId, adminId) => {
  const snap = await getDoc(doc(db, SANCTIONS_COLLECTION, sanctionId))
  const sanction = snap.data()
  await deleteDoc(doc(db, SANCTIONS_COLLECTION, sanctionId))
  if (sanction?.type === 'warning' && sanction?.userId) {
    const userSnap = await getDoc(doc(db, 'users', sanction.userId))
    if (userSnap.exists()) {
      const u = userSnap.data()
      const newWarnings = Math.max(0, (u.warnings || 0) - 1)
      const updates = { warnings: newWarnings }
      if (newWarnings < 3 && u.blockedForWarnings && !u.suspended) {
        updates.isBlocked = false
        updates.blockedForWarnings = false
      }
      await updateDoc(doc(db, 'users', sanction.userId), updates)
    }
  }
  await auditLog('sanction_deleted', { sanctionId }, adminId)
}

export const createReport = async ({ type, targetId, reason, reportedBy, targetUserId }) => {
  await addDoc(collection(db, REPORTS_COLLECTION), {
    type,
    targetId,
    reason,
    reportedBy,
    targetUserId: targetUserId || null,
    resolved: false,
    resolvedAt: null,
    resolvedBy: null,
    resolution: null,
    createdAt: serverTimestamp(),
  })
}

export const getReports = async (maxResults = 50) => {
  const q = query(collection(db, REPORTS_COLLECTION), orderBy('createdAt', 'desc'), limit(maxResults))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const subscribeToReports = (callback) => {
  const q = query(collection(db, REPORTS_COLLECTION), orderBy('createdAt', 'desc'), limit(50))
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
}

export const resolveReport = async (reportId, resolution, adminId) => {
  await updateDoc(doc(db, REPORTS_COLLECTION, reportId), {
    resolved: true,
    resolution,
    resolvedBy: adminId,
    resolvedAt: serverTimestamp(),
  })
  await auditLog('report_resolved', { reportId, resolution }, adminId)
}

export const deleteReport = async (reportId, adminId) => {
  await deleteDoc(doc(db, REPORTS_COLLECTION, reportId))
  await auditLog('report_deleted', { reportId }, adminId)
}

// ─── ENHANCED STORAGE OPERATIONS ───

export const getAllStorageFilesDetailed = async () => {
  const files = []

  try {
    const allItems = await listAllRecursive(ref(storage))
    for (const itemRef of allItems) {
      try {
        const meta = await getMetadata(itemRef)
        let ownerId = 'unknown'
        const parts = itemRef.fullPath.split('/')
        if (parts.length >= 2) ownerId = parts[1]

        files.push({
          name: itemRef.name,
          fullPath: itemRef.fullPath,
          size: meta.size || 0,
          contentType: meta.contentType || 'unknown',
          timeCreated: meta.timeCreated || null,
          updated: meta.updated || null,
          ownerId,
          downloadURL: null,
        })
      } catch {}
    }
  } catch {}

  return files.sort((a, b) => (b.size || 0) - (a.size || 0))
}

export const getStorageByType = async () => {
  const files = await getAllStorageFilesDetailed()
  const byType = {}
  for (const f of files) {
    const ext = (f.name.split('.').pop() || 'unknown').toLowerCase()
    byType[ext] = (byType[ext] || 0) + f.size
  }
  return Object.entries(byType)
    .map(([type, size]) => ({ type, size, count: files.filter((f) => (f.name.split('.').pop() || '').toLowerCase() === type).length }))
    .sort((a, b) => b.size - a.size)
}

export const deleteMultipleStorageFiles = async (paths, adminId) => {
  let deleted = 0
  for (const filePath of paths) {
    try {
      const fileRef = ref(storage, filePath)
      await deleteObject(fileRef)
      deleted++
    } catch {}
  }
  await auditLog('multiple_storage_files_deleted', { count: deleted, paths }, adminId)
  return deleted
}

// ─── CLEANUP OPERATIONS ───

export const findOrphanFiles = async () => {
  const allFiles = []
  try {
    const result = await listAllRecursive(ref(storage))
    for (const itemRef of result) {
      allFiles.push(itemRef.fullPath)
    }
  } catch {}

  const materialSnap = await getDocs(collection(db, 'materials'))
  const referencedPaths = new Set()
  materialSnap.docs.forEach((d) => {
    const data = d.data()
    if (data.filePath) referencedPaths.add(data.filePath)
    if (data.fileUrl) referencedPaths.add(data.fileUrl)
  })

  const userSnap = await getDocs(collection(db, 'users'))
  userSnap.docs.forEach((d) => {
    const data = d.data()
    if (data.photoPath) referencedPaths.add(data.photoPath)
  })

  return allFiles.filter((fp) => !referencedPaths.has(fp))
}

export const findDuplicateFiles = async () => {
  const materialSnap = await getDocs(collection(db, 'materials'))
  const byName = {}
  for (const d of materialSnap.docs) {
    const m = d.data()
    const key = `${m.fileName || ''}_${m.fileSize || 0}`
    if (!byName[key]) byName[key] = []
    byName[key].push({ id: d.id, ...m })
  }
  return Object.values(byName).filter((arr) => arr.length > 1)
}

export const findOldFiles = async (daysOld = 365) => {
  const cutoff = Date.now() - daysOld * 24 * 60 * 60 * 1000
  const materialSnap = await getDocs(collection(db, 'materials'))
  return materialSnap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((m) => {
      const t = m.createdAt?.toDate ? m.createdAt.toDate().getTime() : new Date(m.createdAt || 0).getTime()
      return t < cutoff
    })
}

export const cleanupOrphanFiles = async (orphanPaths, adminId) => {
  let deleted = 0
  for (const fp of orphanPaths) {
    try {
      const fileRef = ref(storage, fp)
      await deleteObject(fileRef)
      deleted++
    } catch {}
  }
  await auditLog('cleanup_orphan_files', { count: deleted }, adminId)
  return deleted
}

export const cleanupOldFiles = async (daysOld, adminId) => {
  const oldFiles = await findOldFiles(daysOld)
  let deleted = 0
  for (const m of oldFiles) {
    try {
      if (m.filePath) {
        const fileRef = ref(storage, m.filePath)
        await deleteObject(fileRef)
      }
      await deleteDoc(doc(db, 'materials', m.id))
      deleted++
    } catch {}
  }
  await auditLog('cleanup_old_files', { count: deleted, daysOld }, adminId)
  return deleted
}

export const cleanupBannedUsers = async (adminId) => {
  const q = query(collection(db, 'users'), where('role', '==', 'banned'))
  const snap = await getDocs(q)
  const banned = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  let deleted = 0
  for (const u of banned) {
    try {
      const userMaterials = query(collection(db, 'materials'), where('userId', '==', u.id))
      const matSnap = await getDocs(userMaterials)
      for (const d of matSnap.docs) {
        const m = d.data()
        if (m.filePath) {
          try { await deleteObject(ref(storage, m.filePath)) } catch {}
        }
        await deleteDoc(doc(db, 'materials', d.id))
      }
      await deleteDoc(doc(db, 'users', u.id))
      deleted++
    } catch {}
  }
  await auditLog('cleanup_banned_users', { count: deleted }, adminId)
  return deleted
}

// ─── ENHANCED STATS ───

export const getDetailedStats = async () => {
  const [usersSnap, materialsSnap] = await Promise.all([
    getDocs(collection(db, 'users')),
    getDocs(collection(db, 'materials')),
  ])

  const users = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
  const materials = materialsSnap.docs.map((d) => ({ id: d.id, ...d.data() }))

  let totalPDFs = 0, totalImages = 0
  const bySubject = {}
  const byYear = {}
  const uploadsByDate = {}
  const userUploadCount = {}

  for (const m of materials) {
    const ext = (m.fileType || '').toLowerCase()
    if (ext === 'pdf') totalPDFs++
    else if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) totalImages++

    const subj = m.subject || 'Sin materia'
    bySubject[subj] = (bySubject[subj] || 0) + 1

    const yr = m.year || 'Sin año'
    byYear[yr] = (byYear[yr] || 0) + 1

    const date = m.createdAt?.toDate ? m.createdAt.toDate().toISOString().split('T')[0] : 'unknown'
    uploadsByDate[date] = (uploadsByDate[date] || 0) + 1

    if (m.userId) userUploadCount[m.userId] = (userUploadCount[m.userId] || 0) + 1
  }

  const mostActive = Object.entries(userUploadCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([uid, count]) => {
      const u = users.find((x) => x.id === uid)
      return { uid, name: u?.displayName || u?.name || 'Unknown', count }
    })

  return {
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.online || (u.lastSeen && Date.now() - (u.lastSeen?.toDate ? u.lastSeen.toDate().getTime() : 0) < 7 * 24 * 60 * 60 * 1000)).length,
    totalMaterials: materials.length,
    totalPDFs, totalImages,
    bySubject, byYear,
    uploadsByDate,
    mostActiveUsers: mostActive,
    blockedUsers: users.filter((u) => u.isBlocked || u.suspended).length,
    warnedUsers: users.filter((u) => (u.warnings || 0) > 0).length,
    usersByRole: {
      admins: users.filter((u) => u.role === ROLES.ADMIN).length,
      moderators: users.filter((u) => u.role === ROLES.MODERADOR).length,
      professors: users.filter((u) => u.role === ROLES.PROFESOR).length,
      students: users.filter((u) => u.role === ROLES.ESTUDIANTE).length,
    },
  }
}