import { useState } from 'react'
import { Box, TextField, MenuItem, Chip, Typography, Button } from '@mui/material'
import { subjects, materialTypes, years } from '../../data/data'

export default function MaterialForm({ initialData, onSubmit, loading }) {
  const [form, setForm] = useState(initialData || { title: '', description: '', subject: '', year: '', type: '', typeLabel: '', tags: [], author: '', authorId: 1 })
  const [tagInput, setTagInput] = useState('')
  const [errors, setErrors] = useState({})

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

  const validate = () => {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Obligatorio'
    if (!form.description.trim()) errs.description = 'Obligatorio'
    if (!form.subject) errs.subject = 'Seleccioná una'
    if (!form.year) errs.year = 'Seleccioná un año'
    if (!form.type) errs.type = 'Seleccioná un tipo'
    if (form.tags.length === 0) errs.tags = 'Al menos una etiqueta'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => { e.preventDefault(); if (validate()) onSubmit(form) }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField label="Título" value={form.title} onChange={handleChange('title')} error={!!errors.title} helperText={errors.title} fullWidth size="small" />
      <TextField label="Descripción" value={form.description} onChange={handleChange('description')} error={!!errors.description} helperText={errors.description} fullWidth multiline rows={2} size="small" />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
        <TextField select label="Año" value={form.year} onChange={handleChange('year')} error={!!errors.year} helperText={errors.year} size="small">
          {years.map((y) => <MenuItem key={y.id} value={y.id}>{y.name}</MenuItem>)}
        </TextField>
        <TextField select label="Materia" value={form.subject} onChange={handleChange('subject')} error={!!errors.subject} helperText={errors.subject} size="small">
          {(subjects || []).map((s) => <MenuItem key={s.id} value={s.name}>{s.name}</MenuItem>)}
        </TextField>
      </Box>
      <TextField select label="Tipo" value={form.type} onChange={handleChange('type')} error={!!errors.type} helperText={errors.type} size="small">
        {materialTypes.map((t) => <MenuItem key={t.id} value={t.value}>{t.name}</MenuItem>)}
      </TextField>
      <Box>
        <TextField label="Etiquetas (Enter)" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleAddTag} fullWidth size="small" error={!!errors.tags} helperText={errors.tags} />
        {form.tags.length > 0 && <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.75 }}>{form.tags.map((tag) => <Chip key={tag} label={tag} size="small" onDelete={() => setForm((p) => ({ ...p, tags: p.tags.filter((t) => t !== tag) }))} sx={{ borderRadius: '6px', fontSize: 11 }} />)}</Box>}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 0.5 }}>
        <Button type="submit" variant="contained" disabled={loading} size="small" sx={{ px: 3, fontSize: 13 }}>{loading ? 'Guardando…' : initialData ? 'Guardar cambios' : 'Subir material'}</Button>
      </Box>
    </Box>
  )
}
