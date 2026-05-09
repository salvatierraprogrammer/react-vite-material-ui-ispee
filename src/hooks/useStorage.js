import { useState, useCallback } from 'react'

export function useStorage() {
  const [uploading, setUploading] = useState(false)

  const uploadFile = useCallback(async (file) => {
    setUploading(true)
    await new Promise((r) => setTimeout(r, 600))
    setUploading(false)
    return { url: URL.createObjectURL(file), name: file.name, size: file.size, type: file.type }
  }, [])

  return { uploading, uploadFile }
}
