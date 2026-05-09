import { useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Box, Typography, Avatar, Badge, Paper, Chip, Stack, Card, Button, TextField, IconButton, CircularProgress } from '@mui/material'
import { SchoolOutlined, AutoStoriesOutlined, FavoriteBorderOutlined, UploadFileOutlined, BadgeOutlined, EditOutlined, SaveOutlined, CloseOutlined, PhotoCamera } from '@mui/icons-material'
import { selectCurrentUser, selectMyMaterials, selectFavorites } from '../redux/selectors'
import { updateUserProfile } from '../services/usersService'
import { uploadProfilePhoto, deleteFile } from '../services/storageService'
import { setUser } from '../redux/slices/authSlice'
import { showSnackbar } from '../redux/slices/uiSlice'
import CropModal from '../components/common/CropModal'

export default function Perfil() {
  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)
  const myMaterials = useSelector(selectMyMaterials)
  const favorites = useSelector(selectFavorites)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [lastName, setLastName] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [cropOpen, setCropOpen] = useState(false)
  const [cropImageSrc, setCropImageSrc] = useState('')
  const fileRef = useRef(null)

  const stats = [
    { icon: UploadFileOutlined, label: 'Aportes', value: myMaterials.length, color: '#8B5CF6' },
    { icon: FavoriteBorderOutlined, label: 'Favoritos', value: favorites.length, color: '#EC4899' },
    { icon: AutoStoriesOutlined, label: 'Descargas', value: myMaterials.reduce((s, m) => s + m.downloads, 0), color: '#10B981' },
    { icon: SchoolOutlined, label: 'Materias', value: [...new Set(myMaterials.map((m) => m.subject))].length, color: '#F59E0B' },
  ]

  const startEdit = () => {
    setName(user?.name || '')
    setLastName(user?.lastName || '')
    setEditing(true)
  }

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      const displayName = `${name.trim()} ${lastName.trim()}`.trim()
      await updateUserProfile(user.uid, {
        name: name.trim(),
        lastName: lastName.trim(),
        displayName,
      })
      dispatch(setUser({ ...user, name: displayName }))
      dispatch(showSnackbar({ message: 'Perfil actualizado', severity: 'success' }))
      setEditing(false)
    } catch {
      dispatch(showSnackbar({ message: 'Error al actualizar perfil', severity: 'error' }))
    }
    setSaving(false)
  }

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      dispatch(showSnackbar({ message: 'Solo imágenes (JPG, PNG)', severity: 'error' }))
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setCropImageSrc(reader.result)
      setCropOpen(true)
    }
    reader.readAsDataURL(file)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleCropSave = async (croppedFile) => {
    setCropOpen(false)
    setUploadingPhoto(true)
    try {
      if (user?.photoPath) await deleteFile(user.photoPath).catch(() => {})
      const result = await uploadProfilePhoto(croppedFile, user.uid)
      await updateUserProfile(user.uid, { photoURL: result.downloadURL, photoPath: result.path })
      dispatch(setUser({ ...user, photoURL: result.downloadURL, photoPath: result.path }))
      dispatch(showSnackbar({ message: 'Foto de perfil actualizada', severity: 'success' }))
    } catch {
      dispatch(showSnackbar({ message: 'Error al subir foto', severity: 'error' }))
    }
    setUploadingPhoto(false)
  }

  return (
    <Box>
      <Card sx={{ p: 2, mb: 1.5, borderRadius: '14px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ position: 'relative' }}>
            <Badge
              overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <IconButton size="small" onClick={() => fileRef.current?.click()} sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' }, width: 24, height: 24 }}>
                  {uploadingPhoto ? <CircularProgress size={12} sx={{ color: '#fff' }} /> : <PhotoCamera sx={{ fontSize: 12, color: '#fff' }} />}
                </IconButton>
              }
            >
              <Avatar src={user?.photoURL || ''} sx={{ width: 52, height: 52, bgcolor: '#8B5CF6', fontSize: 22, fontWeight: 700 }}
                slotProps={{ img: { sx: { objectFit: 'cover' } } }}>
                {user?.name?.charAt(0) || 'E'}
              </Avatar>
            </Badge>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePhotoSelect} />
          </Box>
          <Box sx={{ flex: 1 }}>
            {editing ? (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField size="small" label="Nombre" value={name} onChange={(e) => setName(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: 12 }, minWidth: 120 }} />
                <TextField size="small" label="Apellido" value={lastName} onChange={(e) => setLastName(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: 12 }, minWidth: 120 }} />
                <IconButton onClick={handleSave} disabled={saving} color="primary" size="small">
                  {saving ? <CircularProgress size={16} /> : <SaveOutlined />}
                </IconButton>
                <IconButton onClick={() => setEditing(false)} size="small"><CloseOutlined /></IconButton>
              </Box>
            ) : (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ fontSize: 17, fontWeight: 800 }}>{user?.name || 'Usuario'}</Typography>
                  <IconButton size="small" onClick={startEdit}><EditOutlined sx={{ fontSize: 14 }} /></IconButton>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5, mt: 0.25, flexWrap: 'wrap' }}>
                  <Chip icon={<BadgeOutlined sx={{ fontSize: 11 }} />} label={user?.role || 'Estudiante'} size="small" sx={{ borderRadius: '5px', fontSize: 10, height: 22 }} />
                  <Chip label="ISPEE" size="small" sx={{ borderRadius: '5px', fontSize: 10, height: 22 }} />
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Card>

      <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Paper key={stat.label} sx={{ flex: '1 1 80px', p: 1.25, textAlign: 'center', borderRadius: '10px' }}>
              <Box sx={{ width: 30, height: 30, borderRadius: '8px', bgcolor: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 0.5 }}>
                <Icon sx={{ fontSize: 16, color: stat.color }} />
              </Box>
              <Typography sx={{ fontSize: 17, fontWeight: 800 }}>{stat.value}</Typography>
              <Typography sx={{ fontSize: 10, color: 'text.secondary', fontWeight: 500 }}>{stat.label}</Typography>
            </Paper>
          )
        })}
      </Stack>

      <Card sx={{ p: 1.5, borderRadius: '14px' }}>
        <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 1 }}>Actividad reciente</Typography>
        {myMaterials.length === 0 ? (
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Todavía no hay actividad. ¡Subí tu primer material!</Typography>
        ) : (
          myMaterials.slice(0, 5).map((m) => (
            <Box key={m.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.75, '&:not(:last-child)': { borderBottom: 1, borderColor: 'divider' } }}>
              <Box sx={{ minWidth: 0, flex: 1 }}><Typography sx={{ fontWeight: 600, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.title}</Typography><Typography sx={{ fontSize: 10.5, color: 'text.secondary' }}>{m.subject} · {m.downloads} descargas</Typography></Box>
              <Chip label={m.typeLabel} size="small" sx={{ fontSize: 9, borderRadius: '4px', height: 18 }} />
            </Box>
          ))
        )}
      </Card>

      <CropModal open={cropOpen} imageSrc={cropImageSrc} onCancel={() => setCropOpen(false)} onSave={handleCropSave} />
    </Box>
  )
}
