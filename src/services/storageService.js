import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '../firebase/config'

const ALLOWED_FORMATS = ['pdf', 'png', 'jpg', 'jpeg', 'webp']
const MAX_PDF_SIZE = 10 * 1024 * 1024
const MAX_IMAGE_SIZE = 2 * 1024 * 1024
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
]

export function validateUpload(file) {
  if (!file) return { valid: false, error: 'No se seleccionó ningún archivo' }

  const ext = (file.name.split('.').pop() || '').toLowerCase()
  if (!ext || !ALLOWED_FORMATS.includes(ext)) {
    return { valid: false, error: `Formato .${ext} no permitido. Usá: ${ALLOWED_FORMATS.join(', ')}` }
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: `Tipo de archivo no permitido: ${file.type}` }
  }

  if (ext === 'pdf' && file.size > MAX_PDF_SIZE) {
    return { valid: false, error: `PDF demasiado grande (${(file.size / (1024 * 1024)).toFixed(1)} MB). Máximo: 10 MB` }
  }

  if (['png', 'jpg', 'jpeg', 'webp'].includes(ext) && file.size > MAX_IMAGE_SIZE) {
    return { valid: false, error: `Imagen demasiado grande (${(file.size / (1024 * 1024)).toFixed(1)} MB). Máximo: 2 MB` }
  }

  return { valid: true, error: null }
}

export async function uploadFile(file, userId, onProgress) {
  const validation = validateUpload(file)
  if (!validation.valid) throw new Error(validation.error)

  const ext = file.name.split('.').pop()
  const path = `materials/${userId}/${Date.now()}-${file.name}`
  const storageRef = ref(storage, path)
  const task = uploadBytesResumable(storageRef, file)

  return new Promise((resolve, reject) => {
    task.on(
      'state_changed',
      (snapshot) => {
        const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        onProgress?.(pct)
      },
      (err) => reject(err),
      async () => {
        const downloadURL = await getDownloadURL(task.snapshot.ref)
        resolve({ downloadURL, path, fileName: file.name, fileSize: file.size, fileType: ext })
      }
    )
  })
}

export async function uploadProfilePhoto(file, userId) {
  const ext = file.name.split('.').pop()
  const path = `profiles/${userId}/${Date.now()}-${file.name}`
  const storageRef = ref(storage, path)
  const task = uploadBytesResumable(storageRef, file)

  return new Promise((resolve, reject) => {
    task.on(
      'state_changed',
      null,
      (err) => reject(err),
      async () => {
        const downloadURL = await getDownloadURL(task.snapshot.ref)
        resolve({ downloadURL, path })
      }
    )
  })
}

export async function deleteFile(path) {
  if (!path) return
  await deleteObject(ref(storage, path))
}
