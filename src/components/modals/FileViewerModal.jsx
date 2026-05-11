import { useState } from 'react'
import {
  Dialog, DialogContent, IconButton, Box, Typography, Button, alpha, useTheme, useMediaQuery, CircularProgress,
} from '@mui/material'
import {
  Close, DownloadOutlined, PictureAsPdfOutlined, ImageOutlined, DescriptionOutlined,
} from '@mui/icons-material'
import { formatFileSize } from '../../utils/helpers'

const getFileType = (fileName) => {
  const ext = fileName?.split('.').pop()?.toLowerCase()
  if (!ext) return 'unknown'
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext)) return 'image'
  if (ext === 'pdf') return 'pdf'
  if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods', 'odp'].includes(ext)) return 'office'
  if (['txt', 'csv', 'log', 'md', 'json', 'xml', 'yaml', 'yml'].includes(ext)) return 'text'
  return 'unknown'
}

export default function FileViewerModal({ open, onClose, fileUrl, fileName, fileSize, materialTitle }) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'))
  const [iframeLoaded, setIframeLoaded] = useState(false)

  const fileType = getFileType(fileName)
  const googleViewerUrl = fileUrl ? `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true` : ''

  const FileIcon = fileType === 'pdf' ? PictureAsPdfOutlined
    : fileType === 'image' ? ImageOutlined
    : DescriptionOutlined

  const iconColor = fileType === 'pdf' ? '#EF4444'
    : fileType === 'image' ? '#3B82F6'
    : '#8B5CF6'

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="xl"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            height: fullScreen ? '100%' : '92vh',
            bgcolor: '#0D0D1A',
            borderRadius: fullScreen ? 0 : 3,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          },
        },
      }}
    >
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1.5, px: { xs: 1.5, sm: 2.5 }, py: 1.5,
        bgcolor: alpha('#000', 0.4),
        borderBottom: `1px solid ${alpha('#fff', 0.06)}`,
        flexShrink: 0,
      }}>
        <FileIcon sx={{ color: iconColor, fontSize: 22, flexShrink: 0 }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: { xs: 12, sm: 14 }, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {materialTitle || fileName}
          </Typography>
          <Typography sx={{ fontSize: { xs: 9, sm: 10.5 }, color: alpha('#fff', 0.45), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {fileName} {fileSize ? `• ${formatFileSize(fileSize)}` : ''}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
          {fileUrl && (
            <Button
              component="a"
              href={fileUrl}
              target="_blank"
              size="small"
              variant="outlined"
              startIcon={<DownloadOutlined sx={{ fontSize: 14 }} />}
              sx={{
                borderColor: alpha('#fff', 0.15), color: alpha('#fff', 0.7),
                fontSize: { xs: 10, sm: 11 }, borderRadius: 1.5,
                '&:hover': { borderColor: alpha('#fff', 0.3), bgcolor: alpha('#fff', 0.05) },
                display: { xs: 'none', sm: 'inline-flex' },
              }}
            >
              Descargar
            </Button>
          )}
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ color: alpha('#fff', 0.6), '&:hover': { bgcolor: alpha('#fff', 0.08) }, ml: 0.5 }}
          >
            <Close sx={{ fontSize: { xs: 20, sm: 22 } }} />
          </IconButton>
        </Box>
      </Box>

      <DialogContent sx={{
        flex: 1, p: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        bgcolor: '#0D0D1A', position: 'relative', overflow: 'auto',
      }}>
        {!fileUrl ? (
          <Box sx={{ textAlign: 'center', p: 4, color: alpha('#fff', 0.5) }}>
            <DescriptionOutlined sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
            <Typography sx={{ fontSize: 13 }}>URL del archivo no disponible</Typography>
          </Box>
        ) : fileType === 'image' ? (
          <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            p: { xs: 1, sm: 2 }, width: '100%', height: '100%',
          }}>
            <Box
              component="img"
              src={fileUrl}
              alt={fileName}
              sx={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: 1,
                boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
              }}
            />
          </Box>
        ) : fileType === 'pdf' || fileType === 'office' ? (
          <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
            {!iframeLoaded && (
              <Box sx={{
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: '#0D0D1A', zIndex: 1, flexDirection: 'column', gap: 1.5,
              }}>
                <CircularProgress size={32} sx={{ color: alpha('#fff', 0.4) }} />
                <Typography sx={{ fontSize: 12, color: alpha('#fff', 0.4) }}>Cargando vista previa...</Typography>
              </Box>
            )}
            <iframe
              src={googleViewerUrl}
              title={fileName}
              width="100%"
              height="100%"
              style={{ border: 'none' }}
              onLoad={() => setIframeLoaded(true)}
            />
            <Box sx={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              display: 'flex', gap: 1, p: 1.5,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
              justifyContent: 'center',
            }}>
              <Button
                component="a"
                href={fileUrl}
                target="_blank"
                size="small"
                variant="contained"
                startIcon={<DownloadOutlined sx={{ fontSize: 14 }} />}
                sx={{ borderRadius: 1.5, fontSize: 11, fontWeight: 600, bgcolor: alpha('#fff', 0.15), color: '#fff', backdropFilter: 'blur(8px)', '&:hover': { bgcolor: alpha('#fff', 0.25) } }}
              >
                Abrir en nueva pestaña
              </Button>
            </Box>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', p: 4, color: alpha('#fff', 0.5) }}>
            <DescriptionOutlined sx={{ fontSize: 56, mb: 2, opacity: 0.3 }} />
            <Typography sx={{ fontSize: 13, mb: 2 }}>Vista previa no disponible para este tipo de archivo</Typography>
            <Button
              component="a"
              href={fileUrl}
              target="_blank"
              variant="contained"
              startIcon={<DownloadOutlined />}
              sx={{ borderRadius: 2, fontSize: 12 }}
            >
              Descargar archivo
            </Button>
          </Box>
        )}
      </DialogContent>

      {fullScreen && fileUrl && (
        <Box sx={{
          display: { xs: 'flex', sm: 'none' }, alignItems: 'center', justifyContent: 'center', gap: 1,
          px: 2, py: 1.5, bgcolor: alpha('#000', 0.4), borderTop: `1px solid ${alpha('#fff', 0.06)}`,
          flexShrink: 0,
        }}>
          <Button
            component="a"
            href={fileUrl}
            target="_blank"
            size="small"
            variant="outlined"
            fullWidth
            startIcon={<DownloadOutlined sx={{ fontSize: 14 }} />}
            sx={{ borderColor: alpha('#fff', 0.15), color: alpha('#fff', 0.7), fontSize: 11, borderRadius: 1.5 }}
          >
            Descargar archivo
          </Button>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ color: alpha('#fff', 0.6), '&:hover': { bgcolor: alpha('#fff', 0.08) } }}
          >
            <Close sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      )}
    </Dialog>
  )
}
