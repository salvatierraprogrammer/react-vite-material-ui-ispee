import { useState, useEffect, useRef } from 'react'
import { Box, TextField, InputAdornment, Chip, MenuItem } from '@mui/material'
import { Search, Clear } from '@mui/icons-material'
import { motion } from 'framer-motion'

export default function SearchToolbar({ search, onSearchChange, filters, onFilterChange, placeholder }) {
  const [localSearch, setLocalSearch] = useState(search || '')
  const debounceRef = useRef(null)

  useEffect(() => {
    setLocalSearch(search || '')
  }, [search])

  const handleChange = (value) => {
    setLocalSearch(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onSearchChange(value)
    }, 300)
  }

  const handleClear = () => {
    setLocalSearch('')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    onSearchChange('')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 }}
    >
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', mb: 1.5 }}>
        <TextField
          value={localSearch}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder || 'Buscar…'}
          size="small"
          sx={{ minWidth: { xs: '100%', sm: 220 }, '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: 12.5 } }}
          slotProps={{
            input: {
              startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 16, color: 'text.secondary' }} /></InputAdornment>,
              endAdornment: localSearch ? (
                <InputAdornment position="end" sx={{ cursor: 'pointer' }} onClick={handleClear}>
                  <Clear sx={{ fontSize: 14, color: 'text.secondary' }} />
                </InputAdornment>
              ) : null,
            },
          }}
        />
        {filters?.map((f) => (
          <TextField key={f.key} select value={f.value} onChange={(e) => onFilterChange(f.key, e.target.value)} size="small" sx={{ minWidth: 130, '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: 12.5 } }} label={f.label}>
            <MenuItem value="">{f.label}</MenuItem>
            {f.options.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
          </TextField>
        ))}
      </Box>
    </motion.div>
  )
}
