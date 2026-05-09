import { useDispatch } from 'react-redux'
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, IconButton } from '@mui/material'
import { Close, DeleteOutlined } from '@mui/icons-material'
import { removeMaterial } from '../../redux/slices/materialsSlice'
import { showSnackbar } from '../../redux/slices/uiSlice'

export default function DialogEliminar({ open, onClose, materialId, materialTitle }) {
  const dispatch = useDispatch()

  const handleDelete = async () => {
    await dispatch(removeMaterial(materialId))
    dispatch(showSnackbar({ message: 'Material eliminado correctamente', severity: 'success' }))
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: '20px' } } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontWeight: 700, fontSize: 18 }}>Eliminar material</Typography>
        <IconButton onClick={onClose}><Close /></IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Box sx={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            <DeleteOutlined sx={{ fontSize: 32, color: '#EF4444' }} />
          </Box>
          <Typography sx={{ fontWeight: 600, fontSize: 16, mb: 1 }}>¿Estás segura de eliminar este material?</Typography>
          <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
            Se eliminará <strong>"{materialTitle}"</strong> de forma permanente. Esta acción no se puede deshacer.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center', gap: 1.5 }}>
        <Button onClick={onClose} variant="outlined" sx={{ px: 4 }}>Cancelar</Button>
        <Button onClick={handleDelete} variant="contained" color="error" sx={{ px: 4 }}>
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
