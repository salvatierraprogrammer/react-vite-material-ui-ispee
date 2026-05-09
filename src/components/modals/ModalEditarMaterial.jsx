import { useDispatch } from 'react-redux'
import { Box, Dialog, DialogTitle, DialogContent, IconButton, Typography } from '@mui/material'
import { Close } from '@mui/icons-material'
import MaterialForm from '../forms/MaterialForm'
import { editMaterial } from '../../redux/slices/materialsSlice'
import { showSnackbar } from '../../redux/slices/uiSlice'

export default function ModalEditarMaterial({ open, onClose, material }) {
  const dispatch = useDispatch()

  const handleSubmit = async (formData) => {
    const { tags, ...rest } = formData
    await dispatch(editMaterial({ id: material.id, updates: { ...rest, tags } }))
    dispatch(showSnackbar({ message: 'Material actualizado con éxito', severity: 'success' }))
    onClose()
  }

  if (!material) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth slotProps={{ paper: { sx: { borderRadius: '20px' } } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: 20 }}>Editar material</Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.25 }}>Actualizá los datos de tu material</Typography>
        </Box>
        <IconButton onClick={onClose}><Close /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <MaterialForm initialData={material} onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  )
}
