import { Button } from '@mui/material'

export default function CustomButton({ children, variant = 'contained', color = 'primary', ...props }) {
  return (
    <Button
      variant={variant}
      color={color}
      {...props}
      sx={{
        borderRadius: '12px',
        padding: '10px 24px',
        fontWeight: 600,
        textTransform: 'none',
        transition: 'all 0.2s ease',
        '&:hover': { transform: 'translateY(-1px)' },
        ...props.sx,
      }}
    >
      {children}
    </Button>
  )
}
