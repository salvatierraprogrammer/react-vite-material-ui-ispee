import { useState, useCallback, useRef } from 'react'
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, Slider, Typography, IconButton } from '@mui/material'
import { Close } from '@mui/icons-material'
import Cropper from 'react-easy-crop'

function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

async function getCroppedImg(imageSrc, pixelCrop, rotation = 0) {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.drawImage(
    image,
    pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
    0, 0, pixelCrop.width, pixelCrop.height
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) { reject(new Error('Canvas vacío')); return }
      blob.name = 'profile-cropped.jpg'
      resolve(blob)
    }, 'image/jpeg', 0.9)
  })
}

export default function CropModal({ open, imageSrc, onCancel, onSave }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [saving, setSaving] = useState(false)

  const onCropComplete = useCallback((_, pixelCrop) => {
    setCroppedAreaPixels(pixelCrop)
  }, [])

  const handleSave = async () => {
    if (!croppedAreaPixels) return
    setSaving(true)
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels)
      const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' })
      onSave(file)
    } catch {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: '16px', overflow: 'hidden' } } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 0.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 15 }}>Ajustar foto de perfil</Typography>
        <IconButton onClick={onCancel} size="small"><Close /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ position: 'relative', height: 360, p: 0 }}>
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
      </DialogContent>
      <Box sx={{ px: 3, py: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography sx={{ fontSize: 11, color: 'text.secondary', whiteSpace: 'nowrap' }}>Zoom</Typography>
          <Slider value={zoom} min={1} max={3} step={0.1} onChange={(_, v) => setZoom(v)} sx={{ '& .MuiSlider-thumb': { width: 14, height: 14 } }} />
        </Box>
      </Box>
      <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
        <Button onClick={onCancel} variant="outlined" sx={{ fontSize: 12, borderRadius: '8px', px: 3 }}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained" disabled={saving} sx={{ fontSize: 12, borderRadius: '8px', px: 3 }}>
          {saving ? 'Guardando…' : 'Guardar foto'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
