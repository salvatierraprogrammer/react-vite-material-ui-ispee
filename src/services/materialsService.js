import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  increment,
} from 'firebase/firestore'
import { ref, deleteObject } from 'firebase/storage'
import { db, storage } from '../firebase/config'

const COLLECTION = 'materials'

export const getMaterials = async (materialLimit = 100) => {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'), limit(materialLimit))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const getMaterialById = async (id) => {
  const snap = await getDoc(doc(db, COLLECTION, id))
  if (!snap.exists()) throw new Error('Material no encontrado')
  return { id: snap.id, ...snap.data() }
}

export const createMaterial = async (material) => {
  const docRef = await addDoc(collection(db, COLLECTION), {
    title: material.title,
    description: material.description,
    subject: material.subject,
    year: material.year,
    type: material.type,
    typeLabel: material.typeLabel,
    tags: material.tags,
    author: material.author,
    authorId: material.authorId,
    userId: material.userId,
    fileName: material.fileName || null,
    fileSize: material.fileSize || null,
    fileType: material.fileType || null,
    fileUrl: material.fileUrl || null,
    filePath: material.filePath || null,
    downloads: 0,
    averageRating: 0,
    ratingsCount: 0,
    isFavorite: false,
    createdAt: new Date().toISOString(),
  })
  return { id: docRef.id, ...material, downloads: 0, averageRating: 0, ratingsCount: 0 }
}

export const updateMaterial = async (id, updates) => {
  await updateDoc(doc(db, COLLECTION, id), updates)
  const snap = await getDoc(doc(db, COLLECTION, id))
  return { id: snap.id, ...snap.data() }
}

export const deleteMaterial = async (id) => {
  const snap = await getDoc(doc(db, COLLECTION, id))
  if (snap.exists()) {
    const data = snap.data()
    if (data.filePath) {
      try {
        const storageRef = ref(storage, data.filePath)
        await deleteObject(storageRef)
      } catch {}
    }
  }
  await deleteDoc(doc(db, COLLECTION, id))
  return id
}

export const incrementDownload = async (id) => {
  await updateDoc(doc(db, COLLECTION, id), { downloads: increment(1) })
}
