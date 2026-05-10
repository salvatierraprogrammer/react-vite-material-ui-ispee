import { Component } from 'react'
import { Box, Typography, Button } from '@mui/material'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 2, gap: 1 }}>
          <Typography sx={{ fontSize: 24, fontWeight: 800 }}>Algo salió mal</Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 1, textAlign: 'center' }}>
            {this.state.error?.message || String(this.state.error) || 'Error inesperado'}
          </Typography>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Recargar página
          </Button>
        </Box>
      )
    }
    return this.props.children
  }
}
