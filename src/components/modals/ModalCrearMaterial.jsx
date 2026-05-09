import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Box, Dialog, DialogTitle, DialogContent, IconButton, Typography } from '@mui/material'
import { Close } from '@mui/icons-material'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../firebase/config'
import MaterialForm from '../forms/MaterialForm'
import { addMaterial } from '../../redux/slices/materialsSlice'
import { showSnackbar } from '../../redux/slices/uiSlice'
import { uploadFile } from '../../services/storageService'
import { createNotification } from '../../services/notificationService'

export default function ModalCrearMaterial({ open, onClose }) {
  const dispatch = useDispatch()
  const { currentUser } = useSelector((state) => state.auth)
  const [uploading, setUploading] = useState(false)

  const handleSubmit = async (formData) => {
    setUploading(true)
    try {
      let fileData = {}
      if (formData.file) {
        const result = await uploadFile(formData.file, currentUser?.uid)
      fileData = {
        fileName: result.fileName,
        fileSize: result.fileSize,
        fileType: result.fileType,
        fileUrl: result.downloadURL,
        filePath: result.path,
      }
      }
      await dispatch(addMaterial({
        ...formData,
        ...fileData,
        author: currentUser?.name || 'Anónimo',
        authorId: currentUser?.uid,
        userId: currentUser?.uid,
      })).unwrap()

      const snap = await getDocs(collection(db, 'users'))
      const others = snap.docs.map((d) => d.data()).filter((u) => u.uid !== currentUser?.uid)
      others.forEach((u) => {
        createNotification({
          userId: u.uid,
          text: `${currentUser?.name} subió un nuevo material: ${formData.title}`,
          type: 'material',
        }).catch(() => {})
      })

      dispatch(showSnackbar({ message: 'Material subido con éxito', severity: 'success' }))
      onClose()
    } catch {
      dispatch(showSnackbar({ message: 'Error al subir material', severity: 'error' }))
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth slotProps={{ paper: { sx: { borderRadius: '16px' } } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 0.75 }}>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: 17 }}>Subir nuevo material</Typography>
          <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.25 }}>Compartí tus apuntes con la comunidad ISPEE</Typography>
        </Box>
        <IconButton onClick={onClose} size="small"><Close /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 1.5 }}>
        <MaterialForm onSubmit={handleSubmit} loading={uploading} />
      </DialogContent>
    </Dialog>
  )
}
