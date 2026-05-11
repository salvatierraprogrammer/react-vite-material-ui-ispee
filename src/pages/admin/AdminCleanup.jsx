import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Box, Typography, Paper, Button, TextField, LinearProgress, Alert, AlertTitle } from '@mui/material'
import {
  CleaningServicesOutlined, PersonOffOutlined,
  ScheduleOutlined, LinkOffOutlined,
} from '@mui/icons-material'
import { findOrphanFiles, cleanupOrphanFiles, findOldFiles, cleanupOldFiles, cleanupBannedUsers } from '../../services/adminService'
import { showSnackbar } from '../../redux/slices/uiSlice'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import PageHeader from '../../components/admin/PageHeader'
import { AnimatedPage } from '../../components/admin/AnimatedContainer'
import { motion } from 'framer-motion'

function CleanupTool({ icon, title, description, iconBg, action, children, resultText, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
    >
      <Paper sx={{ borderRadius: '14px', p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
          </Box>
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{title}</Typography>
            <Typography sx={{ fontSize: 10.5, color: 'text.secondary' }}>{description}</Typography>
          </Box>
        </Box>
        {action}
        {children}
        {resultText && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 1 }}>{resultText}</Typography>
          </motion.div>
        )}
      </Paper>
    </motion.div>
  )
}

export default function AdminCleanup() {
  const dispatch = useDispatch()
  const currentUser = useSelector((s) => s.auth.currentUser)
  const [orphanFiles, setOrphanFiles] = useState([])
  const [oldDays, setOldDays] = useState(365)
  const [oldFiles, setOldFiles] = useState([])
  const [loading, setLoading] = useState({})
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [actionType, setActionType] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [results, setResults] = useState(null)

  const handleFindOrphans = async () => {
    setLoading((p) => ({ ...p, orphans: true }))
    try {
      const files = await findOrphanFiles()
      setOrphanFiles(files)
    } catch (e) { dispatch(showSnackbar({ message: e.message, severity: 'error' })) }
    setLoading((p) => ({ ...p, orphans: false }))
  }

  const handleFindOld = async () => {
    setLoading((p) => ({ ...p, old: true }))
    try {
      const files = await findOldFiles(oldDays)
      setOldFiles(files)
    } catch (e) { dispatch(showSnackbar({ message: e.message, severity: 'error' })) }
    setLoading((p) => ({ ...p, old: false }))
  }

  const handleCleanup = async () => {
    if (!currentUser?.uid) return
    setActionLoading(true)
    try {
      let count = 0
      if (actionType === 'orphans') {
        count = await cleanupOrphanFiles(orphanFiles, currentUser.uid)
        setOrphanFiles([])
      } else if (actionType === 'old') {
        count = await cleanupOldFiles(oldDays, currentUser.uid)
        setOldFiles([])
      } else if (actionType === 'banned') {
        count = await cleanupBannedUsers(currentUser.uid)
      }
      setResults({ type: actionType, count })
      setConfirmOpen(false)
      dispatch(showSnackbar({ message: `Limpieza completada: ${count} elemento(s) eliminados`, severity: 'success' }))
    } catch (e) { dispatch(showSnackbar({ message: e.message, severity: 'error' })) }
    setActionLoading(false)
  }

  return (
    <AnimatedPage>
      <PageHeader icon={<CleaningServicesOutlined sx={{ fontSize: 18 }} />} title="Limpieza" description="Herramientas de mantenimiento para limpiar datos innecesarios" />

      {results && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <Alert severity="success" sx={{ mb: 2, borderRadius: '10px' }} onClose={() => setResults(null)}>
            <AlertTitle>Limpieza completada</AlertTitle>
            Se {results.type === 'orphans' ? 'eliminaron' : results.type === 'banned' ? 'eliminaron' : 'limpiaron'} {results.count} elemento(s).
          </Alert>
        </motion.div>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
        <CleanupTool
          icon={<LinkOffOutlined sx={{ fontSize: 17, color: '#F59E0B' }} />}
          title="Archivos huérfanos"
          description="Archivos sin referencia en la DB"
          iconBg="#F59E0B18"
          delay={0}
          action={
            <>
              {loading.orphans && <LinearProgress sx={{ mb: 1, borderRadius: '4px' }} />}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="contained" size="small" onClick={handleFindOrphans} disabled={loading.orphans}
                    sx={{ fontSize: 10.5, fontWeight: 600, py: 0.5, borderRadius: '8px' }}>Buscar</Button>
                </motion.div>
                {orphanFiles.length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileHover={{ scale: 1.02 }}>
                    <Button variant="outlined" color="error" size="small" onClick={() => { setActionType('orphans'); setConfirmOpen(true) }}
                      sx={{ fontSize: 10.5, fontWeight: 600, py: 0.5, borderRadius: '8px' }}>Eliminar {orphanFiles.length}</Button>
                  </motion.div>
                )}
              </Box>
            </>
          }
          resultText={orphanFiles.length > 0 ? `Se encontraron ${orphanFiles.length} archivo(s) huérfano(s).` : undefined}
        />

        <CleanupTool
          icon={<ScheduleOutlined sx={{ fontSize: 17, color: '#3B82F6' }} />}
          title="Archivos antiguos"
          description="Materiales viejos sin uso"
          iconBg="#3B82F618"
          delay={0.06}
          action={
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TextField type="number" value={oldDays} onChange={(e) => setOldDays(+e.target.value)} size="small" label="Días"
                  sx={{ width: 80, '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: 11 } }} />
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="contained" size="small" onClick={handleFindOld} disabled={loading.old}
                    sx={{ fontSize: 10.5, fontWeight: 600, py: 0.5, borderRadius: '8px' }}>Buscar</Button>
                </motion.div>
                {oldFiles.length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileHover={{ scale: 1.02 }}>
                    <Button variant="outlined" color="error" size="small" onClick={() => { setActionType('old'); setConfirmOpen(true) }}
                      sx={{ fontSize: 10.5, fontWeight: 600, py: 0.5, borderRadius: '8px' }}>Limpiar {oldFiles.length}</Button>
                  </motion.div>
                )}
              </Box>
            </>
          }
          resultText={oldFiles.length > 0 ? `${oldFiles.length} material(es) de hace +${oldDays} días.` : undefined}
        />

        <CleanupTool
          icon={<PersonOffOutlined sx={{ fontSize: 17, color: '#EF4444' }} />}
          title="Usuarios baneados"
          description="Cuentas baneadas y sus materiales"
          iconBg="#EF444418"
          delay={0.12}
          action={
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button variant="contained" color="error" size="small" onClick={() => { setActionType('banned'); setConfirmOpen(true) }}
                sx={{ fontSize: 10.5, fontWeight: 600, py: 0.5, borderRadius: '8px' }}>
                Limpiar todo
              </Button>
            </motion.div>
          }
        />
        <Typography sx={{ fontSize: 10.5, color: 'text.disabled', mt: 0.5 }}>Elimina cuentas con role "banned" y sus materiales.</Typography>
      </Box>

      <ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleCleanup} loading={actionLoading}
        title="Confirmar limpieza"
        description={
          actionType === 'orphans' ? `Se eliminarán ${orphanFiles.length} archivo(s) huérfano(s).` :
          actionType === 'old' ? `Se eliminarán ${oldFiles.length} material(es) antiguo(s).` :
          'Se eliminarán todas las cuentas baneadas y sus materiales.'
        }
        consequences="Esta acción no se puede deshacer."
        type="delete" confirmLabel="Limpiar" />
    </AnimatedPage>
  )
}
