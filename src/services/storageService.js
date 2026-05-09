import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '../firebase/config'

export async function uploadFile(file, userId, onProgress) {
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
