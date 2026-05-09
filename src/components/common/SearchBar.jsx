import { Box, InputBase, IconButton } from '@mui/material'
import { Search } from '@mui/icons-material'

export default function SearchBar({ value, onChange, placeholder, ...props }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'rgba(0,0,0,0.04)',
        borderRadius: '12px',
        px: 1.5,
        py: 0.5,
        transition: 'all 0.2s ease',
        '&:focus-within': { bgcolor: 'rgba(139,92,246,0.08)', boxShadow: '0 0 0 2px rgba(139,92,246,0.2)' },
        ...props.sx,
      }}
    >
      <Search sx={{ color: 'text.secondary', fontSize: 20 }} />
      <InputBase
        placeholder={placeholder || 'Buscar...'}
        value={value}
        onChange={onChange}
        sx={{ ml: 1, flex: 1, fontSize: 14 }}
      />
    </Box>
  )
}
