import { useState, useRef } from 'react'
import { Box, TextField, MenuItem, Chip, Typography, Button, Paper } from '@mui/material'
import { Close, PictureAsPdfOutlined, DescriptionOutlined, SlideshowOutlined } from '@mui/icons-material'
import { subjects, materialTypes, years } from '../../data/data'
import { formatFileSize } from '../../utils/helpers'

const ALLOWED_EXTS = ['pdf', 'docx', 'pptx']
const MAX_SIZE = 20 * 1024 * 1024

const fileIcons = { pdf: PictureAsPdfOutlined, docx: DescriptionOutlined, pptx: SlideshowOutlined }
const fileColors = { pdf: '#EF4444', docx: '#2563EB', pptx: '#EA580C' }

export default function MaterialForm({ initialData, onSubmit, loading }) {
  const [form, setForm] = useState(initialData || { title: '', description: '', subject: '', year: '', type: '', typeLabel: '', tags: [], author: '', authorId: 1 })
  const [tagInput, setTagInput] = useState('')
  const [errors, setErrors] = useState({})
  const [file, setFile] = useState(null)
  const [fileError, setFileError] = useState('')
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

  const handleFile = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFileError('')
    const ext = f.name.split('.').pop()?.toLowerCase()
    if (!ALLOWED_EXTS.includes(ext)) { setFileError('Solo PDF, Word (.docx) o PowerPoint (.pptx)'); setFile(null); return }
    if (f.size > MAX_SIZE) { setFileError('El archivo supera los 20 MB'); setFile(null); return }
    setFile(f)
  }

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
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField label="Título" value={form.title} onChange={handleChange('title')} error={!!errors.title} helperText={errors.title} fullWidth size="small" />
      <TextField label="Descripción" value={form.description} onChange={handleChange('description')} error={!!errors.description} helperText={errors.description} fullWidth multiline rows={2} size="small" />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
        <TextField select label="Año" value={form.year} onChange={handleChange('year')} error={!!errors.year} helperText={errors.year} size="small">
          {years.map((y) => <MenuItem key={y.id} value={y.id}>{y.name}</MenuItem>)}
        </TextField>
        <TextField select label="Materia" value={form.subject} onChange={handleChange('subject')} error={!!errors.subject} helperText={errors.subject} size="small">
          {subjects.filter((s) => !form.year || s.year === form.year).map((s) => <MenuItem key={s.id} value={s.name}>{s.name}</MenuItem>)}
        </TextField>
      </Box>
      <TextField select label="Tipo" value={form.type} onChange={handleChange('type')} error={!!errors.type} helperText={errors.type} size="small">
        {materialTypes.map((t) => <MenuItem key={t.id} value={t.value}>{t.name}</MenuItem>)}
      </TextField>

      <Box>
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', mb: 0.75 }}>Archivo *</Typography>
        <input type="file" accept=".pdf,.docx,.pptx" onChange={handleFile} ref={inputRef} style={{ display: 'none' }} id="file-upload" />
        <label htmlFor="file-upload">
          <Button variant="outlined" component="span" fullWidth sx={{ py: 1, borderRadius: '8px', borderStyle: 'dashed', fontSize: 12, color: 'text.secondary' }}>
            {file ? file.name : 'Seleccioná PDF, Word o PowerPoint'}
          </Button>
        </label>
        {fileError && <Typography sx={{ fontSize: 11, color: '#EF4444', mt: 0.5 }}>{fileError}</Typography>}
        {errors.file && <Typography sx={{ fontSize: 11, color: '#EF4444', mt: 0.5 }}>{errors.file}</Typography>}
        {file && (
          <Paper variant="outlined" sx={{ mt: 1, p: 1, display: 'flex', alignItems: 'center', gap: 1, borderRadius: '8px' }}>
            {FileIcon && <FileIcon sx={{ fontSize: 28, color: fColor }} />}
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
              <Typography sx={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</Typography>
              <Typography sx={{ fontSize: 10.5, color: 'text.secondary' }}>{formatFileSize(file.size)} · {file.name.split('.').pop()?.toUpperCase()}</Typography>
            </Box>
            <Chip size="small" label={file.name.split('.').pop()?.toUpperCase()} sx={{ fontSize: 9, fontWeight: 700, borderRadius: '4px', height: 18, bgcolor: fColor ? `${fColor}15` : 'action.hover', color: fColor || 'text.secondary' }} />
            <Chip size="small" onDelete={removeFile} deleteIcon={<Close sx={{ fontSize: 14 }} />} sx={{ bgcolor: 'transparent' }} />
          </Paper>
        )}
      </Box>

      <Box>
        <TextField label="Etiquetas (Enter)" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleAddTag} fullWidth size="small" error={!!errors.tags} helperText={errors.tags} />
        {form.tags.length > 0 && <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.75 }}>{form.tags.map((tag) => <Chip key={tag} label={tag} size="small" onDelete={() => setForm((p) => ({ ...p, tags: p.tags.filter((t) => t !== tag) }))} sx={{ borderRadius: '5px', fontSize: 10.5 }} />)}</Box>}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 0.5 }}>
        <Button type="submit" variant="contained" disabled={loading} size="small" sx={{ px: 3, fontSize: 12.5 }}>{loading ? 'Guardando…' : initialData ? 'Guardar cambios' : 'Subir material'}</Button>
      </Box>
    </Box>
  )
}
