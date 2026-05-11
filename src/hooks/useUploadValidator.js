import { useCallback } from 'react'

const ALLOWED_FORMATS = ['pdf', 'png', 'jpg', 'jpeg', 'webp']
const MAX_PDF_SIZE = 10 * 1024 * 1024
const MAX_IMAGE_SIZE = 2 * 1024 * 1024
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
]

export default function useUploadValidator() {
  const validateFile = useCallback((file) => {
    if (!file) {
      return { valid: false, error: 'No se seleccionó ningún archivo' }
    }

    const extension = file.name.split('.').pop()?.toLowerCase()
    if (!extension || !ALLOWED_FORMATS.includes(extension)) {
      return {
        valid: false,
        error: `Formato .${extension} no permitido. Formatos aceptados: ${ALLOWED_FORMATS.join(', ')}`,
      }
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `Tipo MIME ${file.type} no permitido.`,
      }
    }

    if (extension === 'pdf' && file.size > MAX_PDF_SIZE) {
      return {
        valid: false,
        error: `El archivo PDF excede el límite de 10 MB. (${(file.size / (1024 * 1024)).toFixed(1)} MB)`,
      }
    }

    if (['png', 'jpg', 'jpeg', 'webp'].includes(extension) && file.size > MAX_IMAGE_SIZE) {
      return {
        valid: false,
        error: `La imagen excede el límite de 2 MB. (${(file.size / (1024 * 1024)).toFixed(1)} MB)`,
      }
    }

    return { valid: true, error: null }
  }, [])

  const validateMultipleFiles = useCallback((files) => {
    const errors = []
    for (const file of files) {
      const result = validateFile(file)
      if (!result.valid) {
        errors.push({ file: file.name, error: result.error })
      }
    }
    return { valid: errors.length === 0, errors }
  }, [validateFile])

  return {
    validateFile,
    validateMultipleFiles,
    ALLOWED_FORMATS,
    MAX_PDF_SIZE,
    MAX_IMAGE_SIZE,
  }
}
