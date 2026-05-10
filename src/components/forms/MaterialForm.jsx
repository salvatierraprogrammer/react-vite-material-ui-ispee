import { useState, useRef, useCallback } from 'react'
import { Box, TextField, MenuItem, Chip, Typography, Button, Paper } from '@mui/material'
import { CloudUploadOutlined, Close, PictureAsPdfOutlined, DescriptionOutlined, SlideshowOutlined, SchoolOutlined, CategoryOutlined, TagOutlined, ArrowForward } from '@mui/icons-material'
import { subjects, materialTypes, years } from '../../data/data'
import { formatFileSize } from '../../utils/helpers'

const ALLOWED_EXTS = ['pdf', 'docx', 'pptx']
const MAX_SIZE = 20 * 1024 * 1024

const SELECT_MENU_PROPS = {
  disablePortal: false,
  sx: {
    zIndex: 9999,
    '& .MuiPaper-root': {
      zIndex: 9999,
      maxHeight: { xs: 200, sm: 280, md: 320 },
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: '10px',
      mt: 0.5,
    },
  },
  anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
  transformOrigin: { vertical: 'top', horizontal: 'left' },
  marginThreshold: 4,
}

const fileIcons = { pdf: PictureAsPdfOutlined, docx: DescriptionOutlined, pptx: SlideshowOutlined }
const fileColors = { pdf: '#EF4444', docx: '#2563EB', pptx: '#EA580C' }

export default function MaterialForm({ initialData, onSubmit, loading }) {
  const [form, setForm] = useState(initialData || { title: '', description: '', subject: '', year: '', type: '', typeLabel: '', tags: [], author: '', authorId: 1 })
  const [tagInput, setTagInput] = useState('')
  const [errors, setErrors] = useState({})
  const [file, setFile] = useState(null)
  const [fileError, setFileError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef(null)

  const handleChange = (field) => (e) => {
    const val = e.target.value
    setForm((prev) => {
      const upd = { ...prev, [field]: val }
      if (field === 'type') { const mt = materialTypes.find((t) => t.value === val); upd.typeLabel = mt ? mt.name : '' }
      return upd
    })
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }))
  }

  const handleAddTag = (e) => { if (e.key === 'Enter' && tagInput.trim()) { e.preventDefault(); if (!form.tags.includes(tagInput.trim())) setForm((p) => ({ ...p, tags: [...p.tags, tagInput.trim()] })); setTagInput('') } }

  const processFile = useCallback((f) => {
    if (!f) return
    setFileError('')
    const ext = f.name.split('.').pop()?.toLowerCase()
    if (!ALLOWED_EXTS.includes(ext)) { setFileError('Solo PDF, Word (.docx) o PowerPoint (.pptx)'); setFile(null); return }
    if (f.size > MAX_SIZE) { setFileError('El archivo supera los 20 MB'); setFile(null); return }
    setFile(f)
  }, [])

  const handleFile = (e) => processFile(e.target.files?.[0])

  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); processFile(e.dataTransfer.files[0]) }

  const removeFile = () => { setFile(null); setFileError(''); if (inputRef.current) inputRef.current.value = '' }

  const validate = () => {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Obligatorio'
    if (!form.description.trim()) errs.description = 'Obligatorio'
    if (!form.subject) errs.subject = 'Seleccioná una'
    if (!form.year) errs.year = 'Seleccioná un año'
    if (!form.type) errs.type = 'Seleccioná un tipo'
    if (form.tags.length === 0) errs.tags = 'Al menos una etiqueta'
    if (!file && !initialData) errs.file = 'Seleccioná un archivo'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => { e.preventDefault(); if (validate()) onSubmit({ ...form, file }) }

  const FileIcon = file ? fileIcons[file.name.split('.').pop()?.toLowerCase()] : null
  const fColor = file ? fileColors[file.name.split('.').pop()?.toLowerCase()] : null

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Paper elevation={0} sx={{ p: 2, borderRadius: '12px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
        <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.05, mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <SchoolOutlined sx={{ fontSize: 15, color: 'primary.main' }} /> Información del material
        </Typography>
        <TextField label="Título del material" value={form.title} onChange={handleChange('title')} error={!!errors.title} helperText={errors.title} fullWidth size="small" placeholder="Ej: Resumen de Psicología Educacional" slotProps={{ inputLabel: { shrink: true } }} sx={{ mb: 1.5 }} />
        <TextField label="Descripción" value={form.description} onChange={handleChange('description')} error={!!errors.description} helperText={errors.description} fullWidth multiline rows={3} size="small" placeholder="Contá de qué trata el material..." slotProps={{ inputLabel: { shrink: true } }} />
      </Paper>

      <Paper elevation={0} sx={{ p: 2, borderRadius: '12px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
        <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.05, mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <CategoryOutlined sx={{ fontSize: 15, color: 'primary.main' }} /> Clasificación
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5, mb: 1.5 }}>
          <TextField select label="Año" value={form.year} onChange={handleChange('year')} error={!!errors.year} helperText={errors.year} size="small" slotProps={{ inputLabel: { shrink: true } }} SelectProps={{ displayEmpty: true, MenuProps: SELECT_MENU_PROPS }}>
            <MenuItem value="" disabled sx={{ fontSize: 13, color: 'text.secondary' }}>Seleccioná un año</MenuItem>
            {years.map((y) => <MenuItem key={y.id} value={y.id} sx={{ fontSize: 13 }}>{y.name}</MenuItem>)}
          </TextField>
          <TextField select label="Materia" value={form.subject} onChange={handleChange('subject')} error={!!errors.subject} helperText={errors.subject} size="small" slotProps={{ inputLabel: { shrink: true } }} SelectProps={{ displayEmpty: true, MenuProps: SELECT_MENU_PROPS }}>
            <MenuItem value="" disabled sx={{ fontSize: 13, color: 'text.secondary' }}>Seleccioná una materia</MenuItem>
            {(subjects || []).map((s) => <MenuItem key={s.id} value={s.name} sx={{ fontSize: 13 }}>{s.name}</MenuItem>)}
          </TextField>
        </Box>
        <TextField select label="Tipo de material" value={form.type} onChange={handleChange('type')} error={!!errors.type} helperText={errors.type} size="small" fullWidth slotProps={{ inputLabel: { shrink: true } }} SelectProps={{ displayEmpty: true, MenuProps: SELECT_MENU_PROPS }}>
          <MenuItem value="" disabled sx={{ fontSize: 13, color: 'text.secondary' }}>Seleccioná un tipo</MenuItem>
          {materialTypes.map((t) => <MenuItem key={t.id} value={t.value} sx={{ fontSize: 13 }}>{t.name}</MenuItem>)}
        </TextField>
      </Paper>

      <Paper elevation={0} sx={{ p: 2, borderRadius: '12px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
        <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.05, mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <CloudUploadOutlined sx={{ fontSize: 15, color: 'primary.main' }} /> Archivo {!initialData && <Typography component="span" sx={{ fontSize: 12, color: '#EF4444' }}>*</Typography>}
        </Typography>
        <input type="file" accept=".pdf,.docx,.pptx" onChange={handleFile} ref={inputRef} style={{ display: 'none' }} id="file-upload" />
        {!file ? (
          <Box
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            sx={{
              border: '2px dashed', borderColor: dragOver ? 'primary.main' : errors.file ? '#EF4444' : 'divider',
              borderRadius: '12px', p: 2.5, textAlign: 'center', cursor: 'pointer',
              bgcolor: dragOver ? 'rgba(139,92,246,0.04)' : 'transparent',
              transition: 'all 0.2s ease',
              '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(139,92,246,0.04)' }
            }}
          >
            <CloudUploadOutlined sx={{ fontSize: 36, color: dragOver ? 'primary.main' : 'text.disabled', mb: 0.75 }} />
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: dragOver ? 'primary.main' : 'text.secondary' }}>{dragOver ? 'Soltá el archivo aquí' : 'Hacé clic o arrastrá tu archivo'}</Typography>
            <Typography sx={{ fontSize: 11, color: 'text.disabled', mt: 0.25 }}>PDF, Word o PowerPoint · Máx 20 MB</Typography>
            {errors.file && <Typography sx={{ fontSize: 11, color: '#EF4444', mt: 0.5 }}>{errors.file}</Typography>}
            {fileError && <Typography sx={{ fontSize: 11, color: '#EF4444', mt: 0.5 }}>{fileError}</Typography>}
          </Box>
        ) : (
          <Paper variant="outlined" sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, borderRadius: '10px', bgcolor: fColor ? `${fColor}06` : 'transparent', borderColor: fColor ? `${fColor}30` : 'divider' }}>
            <Box sx={{ width: 40, height: 40, borderRadius: '8px', bgcolor: fColor ? `${fColor}12` : 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {FileIcon && <FileIcon sx={{ fontSize: 22, color: fColor }} />}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 12.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</Typography>
              <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{formatFileSize(file.size)}</Typography>
            </Box>
            <Chip size="small" label={file.name.split('.').pop()?.toUpperCase()} sx={{ fontSize: 9, fontWeight: 700, borderRadius: '4px', height: 20, bgcolor: fColor ? `${fColor}15` : 'action.hover', color: fColor || 'text.secondary' }} />
            <Chip size="small" onDelete={removeFile} deleteIcon={<Close sx={{ fontSize: 14 }} />} sx={{ bgcolor: 'transparent', '& .MuiChip-deleteIcon': { color: 'text.disabled' } }} />
          </Paper>
        )}
      </Paper>

      <Paper elevation={0} sx={{ p: 2, borderRadius: '12px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
        <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.05, mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <TagOutlined sx={{ fontSize: 15, color: 'primary.main' }} /> Etiquetas
        </Typography>
        <TextField label="Agregá etiquetas y presioná Enter" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleAddTag} fullWidth size="small" error={!!errors.tags} helperText={errors.tags} slotProps={{ inputLabel: { shrink: true } }} />
        {form.tags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1 }}>
            {form.tags.map((tag) => (
              <Chip key={tag} label={tag} size="small" onDelete={() => setForm((p) => ({ ...p, tags: p.tags.filter((t) => t !== tag) }))} sx={{ borderRadius: '6px', fontSize: 11, fontWeight: 500, bgcolor: 'rgba(139,92,246,0.08)', color: 'primary.main', '& .MuiChip-deleteIcon': { fontSize: 14, color: 'primary.main' } }} />
            ))}
          </Box>
        )}
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 0.5 }}>
        <Button type="submit" variant="contained" disabled={loading} size="medium" endIcon={loading ? null : <ArrowForward sx={{ fontSize: 16 }} />} sx={{ px: 3.5, py: 0.75, fontSize: 13, fontWeight: 700, borderRadius: '8px', textTransform: 'none', boxShadow: '0 4px 14px rgba(139,92,246,0.25)' }}>
          {loading ? 'Subiendo…' : initialData ? 'Guardar cambios' : 'Publicar material'}
        </Button>
      </Box>
    </Box>
  )
}
