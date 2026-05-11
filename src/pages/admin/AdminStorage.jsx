import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Box, Typography, Paper, IconButton, Tooltip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, TextField, InputAdornment, LinearProgress, Alert, AlertTitle, Chip, alpha } from '@mui/material'
import {
  StorageOutlined, DeleteOutlined, DescriptionOutlined, CloudQueueOutlined, WarningAmberOutlined,
  AttachMoneyOutlined, Search, Clear, OpenInNewOutlined, InsertDriveFileOutlined, ImageOutlined,
  PictureAsPdfOutlined, ArticleOutlined, FolderOpenOutlined,
} from '@mui/icons-material'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip } from 'recharts'
import { getStorageStats, getStorageByType, deleteStorageFile } from '../../services/adminService'
import { showSnackbar } from '../../redux/slices/uiSlice'
import { ref, getDownloadURL } from 'firebase/storage'
import { storage } from '../../firebase/config'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import PageHeader from '../../components/admin/PageHeader'
import StatCard from '../../components/admin/StatCard'
import FileViewerModal from '../../components/modals/FileViewerModal'
import { AnimatedPage } from '../../components/admin/AnimatedContainer'
import { formatFileSize } from '../../utils/helpers'
import { motion } from 'framer-motion'

const PIE_COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#14B8A6', '#F97316']

const TYPE_ICONS = {
  pdf: <PictureAsPdfOutlined sx={{ fontSize: 16 }} />,
  jpg: <ImageOutlined sx={{ fontSize: 16 }} />,
  jpeg: <ImageOutlined sx={{ fontSize: 16 }} />,
  png: <ImageOutlined sx={{ fontSize: 16 }} />,
  webp: <ImageOutlined sx={{ fontSize: 16 }} />,
  doc: <ArticleOutlined sx={{ fontSize: 16 }} />,
  docx: <ArticleOutlined sx={{ fontSize: 16 }} />,
}

function StorageProgressBar({ percentage, totalSize, isCritical, isBillingWarning }) {
  const barColor = isCritical ? '#EF4444' : isBillingWarning ? '#F59E0B' : '#8B5CF6'
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
    >
      <Paper sx={{
        borderRadius: '16px',
        p: 2.5,
        mb: 2.5,
        border: '1px solid',
        borderColor: 'divider',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FolderOpenOutlined sx={{ fontSize: 18, color: barColor }} />
            <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Almacenamiento Firebase</Typography>
          </Box>
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>
            {formatFileSize(totalSize)} <Typography component="span" sx={{ fontSize: 11, color: 'text.disabled', fontWeight: 400 }}>/ 5 GB</Typography>
          </Typography>
        </Box>

        <Box sx={{ position: 'relative', mb: 1 }}>
          <LinearProgress
            variant="determinate"
            value={Math.min(percentage || 0, 100)}
            sx={{
              height: 12,
              borderRadius: '8px',
              bgcolor: alpha(barColor, 0.1),
              '& .MuiLinearProgress-bar': {
                background: `linear-gradient(90deg, ${barColor}, ${barColor}cc)`,
                borderRadius: '8px',
                transition: 'transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)',
              },
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: 9, color: '#10B981', fontWeight: 700 }}>0 GB</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: 9, color: '#F59E0B', fontWeight: 700 }}>4.5 GB ⚠️</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: 9, color: '#EF4444', fontWeight: 700 }}>5 GB 💰</Typography>
          </Box>
        </Box>
      </Paper>
    </motion.div>
  )
}

function FileTypeBreakdown({ byType }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.16 }}
    >
      <Paper sx={{
        borderRadius: '16px',
        p: 2.5,
        mb: 2.5,
        border: '1px solid',
        borderColor: 'divider',
      }}>
        <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 2 }}>Almacenamiento por tipo de archivo</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'center' }}>
          <Box sx={{ width: { xs: '100%', sm: 200 }, height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byType}
                  cx="50%" cy="50%"
                  innerRadius={50}
                  outerRadius={82}
                  paddingAngle={3}
                  dataKey="size"
                  nameKey="type"
                >
                  {byType.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <ReTooltip
                  contentStyle={{
                    borderRadius: 8, fontSize: 11, border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value) => formatFileSize(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          </Box>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            {byType.map((t, i) => (
              <Box key={t.type} sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                py: 0.5,
                px: 1.5,
                borderRadius: '8px',
                transition: 'background-color 0.15s ease',
                '&:hover': { bgcolor: alpha(PIE_COLORS[i % PIE_COLORS.length], 0.05) },
              }}>
                <Box sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '4px',
                  bgcolor: PIE_COLORS[i % PIE_COLORS.length],
                  flexShrink: 0,
                }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    {TYPE_ICONS[t.type] || <InsertDriveFileOutlined sx={{ fontSize: 14, color: 'text.secondary' }} />}
                    <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
                      .{t.type.toUpperCase()}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography sx={{ fontSize: 11.5, fontWeight: 600 }}>
                    {formatFileSize(t.size)}
                  </Typography>
                  <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>
                    {t.count} archivos
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Paper>
    </motion.div>
  )
}

const FILE_EXT_COLORS = { pdf: '#EF4444', docx: '#2563EB', pptx: '#EA580C', xlsx: '#10B981', jpg: '#8B5CF6', jpeg: '#8B5CF6', png: '#8B5CF6', webp: '#8B5CF6', mp4: '#F59E0B' }

function getExtColor(name) {
  const ext = (name || '').split('.').pop().toLowerCase()
  return FILE_EXT_COLORS[ext] || '#6B7280'
}

export default function AdminStorage() {
  const dispatch = useDispatch()
  const currentUser = useSelector((s) => s.auth.currentUser)
  const [storageData, setStorageData] = useState(null)
  const [byType, setByType] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [selected, setSelected] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewFile, setViewFile] = useState(null)
  const searchDebounceRef = useRef(null)

  useEffect(() => {
    Promise.all([
      getStorageStats(),
      getStorageByType(),
    ]).then(([s, bt]) => { setStorageData(s); setByType(bt); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const files = storageData?.files || []
  const filtered = useMemo(() => files.filter((f) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (f.name || '').toLowerCase().includes(q) || (f.fullPath || '').toLowerCase().includes(q)
  }), [files, search])

  const handleDelete = async () => {
    if (!selected || !currentUser?.uid) return
    setActionLoading(true)
    try {
      await deleteStorageFile(selected.fullPath, currentUser.uid)
      dispatch(showSnackbar({ message: `Archivo ${selected.name} eliminado`, severity: 'success' }))
      setStorageData((prev) => ({ ...prev, files: prev.files.filter((f) => f.fullPath !== selected.fullPath), fileCount: prev.fileCount - 1, totalSize: prev.totalSize - selected.size }))
      setConfirmOpen(false)
    } catch (e) { dispatch(showSnackbar({ message: e.message, severity: 'error' })) }
    setActionLoading(false)
  }

  const getExtColor = (name) => {
    const ext = (name || '').split('.').pop().toLowerCase()
    const colors = { pdf: '#EF4444', docx: '#2563EB', pptx: '#EA580C', xlsx: '#10B981', jpg: '#8B5CF6', jpeg: '#8B5CF6', png: '#8B5CF6', webp: '#8B5CF6', mp4: '#F59E0B' }
    return colors[ext] || '#6B7280'
  }

  const handleOpenViewer = useCallback(async (f) => {
    try {
      const url = await getDownloadURL(ref(storage, f.fullPath))
      setViewFile({ ...f, fileUrl: url })
      setViewerOpen(true)
    } catch {
      dispatch(showSnackbar({ message: 'No se pudo cargar el archivo', severity: 'error' }))
    }
  }, [dispatch])

  return (
    <AnimatedPage>
      <PageHeader
        icon={<StorageOutlined sx={{ fontSize: 20 }} />}
        title="Almacenamiento"
        description="Gestioná los archivos almacenados en Firebase Storage"
        badge={loading ? '…' : `${storageData?.fileCount || 0} archivos`}
      />

      {storageData?.isBillingWarning && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <Alert severity="warning" sx={{
            mb: 2.5,
            borderRadius: '12px',
            border: '1px solid',
            borderColor: alpha('#F59E0B', 0.2),
            '& .MuiAlert-icon': { color: '#F59E0B' },
          }} icon={<AttachMoneyOutlined />}>
            <AlertTitle sx={{ fontWeight: 700, fontSize: 13 }}>Umbral de facturación próximo</AlertTitle>
            <Typography sx={{ fontSize: 12 }}>
              Has alcanzado <strong>{formatFileSize(storageData.totalSize)}</strong> de los 5 GB gratuitos de Firebase Storage. A partir de los <strong>4.5 GB</strong> se acerca el límite. Si superás los 5 GB, Firebase comenzará a facturar. Considerá limpiar archivos innecesarios.
            </Typography>
          </Alert>
        </motion.div>
      )}

      {storageData?.isCritical && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <Alert severity="error" sx={{
            mb: 2.5,
            borderRadius: '12px',
            border: '1px solid',
            borderColor: alpha('#EF4444', 0.2),
          }}>
            <AlertTitle sx={{ fontWeight: 700, fontSize: 13 }}>¡Límite de almacenamiento crítico!</AlertTitle>
            <Typography sx={{ fontSize: 12 }}>
              Estás usando <strong>{storageData.percentage?.toFixed(1)}%</strong> del espacio gratuito. Firebase facturará automáticamente cuando superes los 5 GB. Es urgente liberar espacio.
            </Typography>
          </Alert>
        </motion.div>
      )}

      {loading ? (
        <Box sx={{ mb: 3 }}><LinearProgress sx={{ height: 6, borderRadius: 3 }} /></Box>
      ) : storageData && (
        <>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2.5, mb: 2.5 }}>
            <StatCard icon={<CloudQueueOutlined sx={{ fontSize: 18, color: '#3B82F6' }} />} label="Espacio usado" value={formatFileSize(storageData.totalSize)} color="#3B82F6" subtitle="de 5 GB gratuitos" delay={0} />
            <StatCard icon={<DescriptionOutlined sx={{ fontSize: 18, color: '#8B5CF6' }} />} label="Archivos" value={storageData.fileCount} color="#8B5CF6" delay={0.04} />
            <StatCard
              icon={<WarningAmberOutlined sx={{ fontSize: 18, color: storageData.isCritical ? '#EF4444' : storageData.isBillingWarning ? '#F59E0B' : '#10B981' }} />}
              label="Uso del límite"
              value={`${storageData.percentage?.toFixed(1) || 0}%`}
              color={storageData.isCritical ? '#EF4444' : storageData.isBillingWarning ? '#F59E0B' : '#10B981'}
              subtitle={storageData.isCritical ? '¡Límite excedido! Firebase facturará' : storageData.isBillingWarning ? 'Umbral de facturación (4.5 GB)' : 'Dentro del límite gratuito'}
              delay={0.08}
            />
          </Box>

          <StorageProgressBar
            percentage={storageData.percentage}
            totalSize={storageData.totalSize}
            isCritical={storageData.isCritical}
            isBillingWarning={storageData.isBillingWarning}
          />

          {byType.length > 0 && <FileTypeBreakdown byType={byType} />}
        </>
      )}

      {/* Tabla de archivos */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Paper sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: alpha('#8B5CF6', 0.02) }}>
            <TextField
              onChange={(e) => {
                const v = e.target.value
                if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
                searchDebounceRef.current = setTimeout(() => { setSearch(v); setPage(0) }, 250)
              }}
              placeholder="Buscar archivos…"
              size="small"
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  fontSize: 13,
                  bgcolor: 'background.paper',
                },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ fontSize: 18, color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  endAdornment: search ? (
                    <InputAdornment position="end" sx={{ cursor: 'pointer' }} onClick={() => { setSearch(''); setPage(0) }}>
                      <Clear sx={{ fontSize: 16, color: 'text.secondary' }} />
                    </InputAdornment>
                  ) : null,
                },
              }}
            />
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{
                  '& th': {
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    py: 1.25,
                    bgcolor: alpha('#8B5CF6', 0.03),
                  },
                }}>
                  <TableCell>Archivo</TableCell>
                  <TableCell>Tamaño</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((f, i) => (
                  <TableRow
                    key={`${f.fullPath}-${i}`}
                    sx={{
                      '& td': { py: 0.75 },
                      '&:hover': { bgcolor: alpha('#8B5CF6', 0.02) },
                      cursor: 'pointer',
                      animation: 'slideIn 0.3s ease-out',
                      animationDelay: `${i * 0.02}s`,
                      animationFillMode: 'backwards',
                      '@keyframes slideIn': {
                        from: { opacity: 0, transform: 'translateX(-8px)' },
                        to: { opacity: 1, transform: 'translateX(0)' },
                      },
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        <Box sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: getExtColor(f.name),
                          flexShrink: 0,
                          boxShadow: `0 0 6px ${alpha(getExtColor(f.name), 0.4)}`,
                        }} />
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            onClick={() => handleOpenViewer(f)}
                            sx={{
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'color 0.15s ease',
                              '&:hover': { color: 'primary.main' },
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: 220,
                            }}
                          >
                            {f.name}
                          </Typography>
                          <Typography sx={{
                            fontSize: 10,
                            color: 'text.disabled',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: 260,
                          }}>
                            {f.fullPath?.slice(0, 60)}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: 12, fontWeight: 500 }}>{formatFileSize(f.size)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={f.contentType?.split('/').pop() || '—'}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: 9.5,
                          fontWeight: 600,
                          bgcolor: alpha(getExtColor(f.name), 0.1),
                          color: getExtColor(f.name),
                          borderRadius: '6px',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }}>
                        {f.timeCreated ? new Date(f.timeCreated).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      <Tooltip title="Ver archivo">
                      <IconButton size="small" onClick={() => handleOpenViewer(f)} sx={{ mr: 0.25, transition: 'all 0.15s ease', '&:hover': { bgcolor: '#3B82F618', transform: 'scale(1.1)' } }}>
                        <OpenInNewOutlined sx={{ fontSize: 15, color: '#3B82F6' }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar archivo">
                      <IconButton size="small" onClick={() => { setSelected(f); setConfirmOpen(true) }} sx={{ transition: 'all 0.15s ease', '&:hover': { bgcolor: '#EF444418', transform: 'scale(1.1)' } }}>
                        <DeleteOutlined sx={{ fontSize: 15, color: '#EF4444' }} />
                      </IconButton>
                    </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', py: 6, fontSize: 12, color: 'text.secondary' }}>
                      No hay archivos que coincidan con tu búsqueda.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filtered.length}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(+e.target.value); setPage(0) }}
            rowsPerPageOptions={[10, 25, 50]}
            labelRowsPerPage="Filas"
            sx={{
              fontSize: 12,
              borderTop: '1px solid',
              borderColor: 'divider',
              '& .MuiTablePagination-toolbar': { minHeight: 48 },
            }}
          />
        </Paper>
      </motion.div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        loading={actionLoading}
        title="Eliminar archivo"
        description={`¿Eliminar "${selected?.name}"?`}
        consequences="Esta acción es irreversible. El archivo se borrará permanentemente de Firebase Storage."
        type="delete"
        confirmLabel="Eliminar"
      />

      <FileViewerModal
        open={viewerOpen}
        onClose={() => { setViewerOpen(false); setViewFile(null) }}
        fileUrl={viewFile?.fileUrl || ''}
        fileName={viewFile?.name || ''}
        fileSize={viewFile?.size}
        materialTitle={viewFile?.name}
      />
    </AnimatedPage>
  )
}
