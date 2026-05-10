import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Box, Dialog, DialogTitle, DialogContent, IconButton, Typography, LinearProgress } from '@mui/material'
import { Close, CloudUploadOutlined } from '@mui/icons-material'
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
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleSubmit = async (formData) => {
    if (!currentUser?.uid) {
      dispatch(showSnackbar({ message: 'Debés iniciar sesión para subir materiales', severity: 'warning' }))
      onClose()
      return
    }
    setUploading(true)
    setUploadProgress(0)
    try {
      let fileData = {}
      if (formData.file) {
        const result = await uploadFile(formData.file, currentUser?.uid, (pct) => setUploadProgress(pct))
      fileData = {
        fileName: result.fileName,
        fileSize: result.fileSize,
        fileType: result.fileType,
        fileUrl: result.downloadURL,
        filePath: result.path,
      }
      }
      setUploadProgress(95)
      await dispatch(addMaterial({
        ...formData,
        ...fileData,
        author: currentUser?.name || 'Anónimo',
        authorId: currentUser?.uid,
        authorPhoto: currentUser?.photoURL || '',
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
      setUploadProgress(0)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={uploading ? undefined : onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: { xs: 0, sm: '16px' },
            margin: { xs: 0, sm: 2 },
            width: { xs: '100%', sm: 'calc(100% - 32px)' },
            height: { xs: '100%', sm: 'auto' },
            maxHeight: { xs: '100%', sm: '90vh' },
          }
        }
      }}
    >
      {uploading && <LinearProgress variant="determinate" value={uploadProgress} sx={{ position: 'absolute', top: 0, left: 0, right: 0, borderRadius: { xs: 0, sm: '16px 16px 0 0' }, height: 3 }} />}
      <DialogTitle sx={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        pt: { xs: 2, sm: 2.5 }, pb: 1,
        px: { xs: 2, sm: 3 },
        borderBottom: 1, borderColor: 'divider',
        bgcolor: 'background.default'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 38, height: 38, borderRadius: '10px', background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', display: { xs: 'none', sm: 'flex' }, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CloudUploadOutlined sx={{ color: '#fff', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: { xs: 16, sm: 17 } }}>Subir nuevo material</Typography>
            <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.25 }}>Compartí tus apuntes con la comunidad ISPEE</Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" disabled={uploading} sx={{ mt: -0.5, mr: -0.5 }}><Close /></IconButton>
      </DialogTitle>
      <DialogContent sx={{
        pt: { xs: 2, sm: 2.5 },
        px: { xs: 2, sm: 3 },
        pb: { xs: 2, sm: 3 },
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}>
        <MaterialForm onSubmit={handleSubmit} loading={uploading} />
      </DialogContent>
    </Dialog>
  )
}
