import { createTheme } from '@mui/material/styles'

const shared = {
  typography: {
    fontFamily: '"Poppins", "Inter", "Roboto", sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  shape: { borderRadius: 12 },
  spacing: 8,
}

const componentOverrides = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 10,
        padding: '6px 18px',
        boxShadow: 'none',
        '&:hover': { boxShadow: 'none', transform: 'translateY(-1px)' },
        transition: 'all 0.2s ease',
        minHeight: 0,
      },
      containedPrimary: {
        background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
        '&:hover': { background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' },
      },
    },
    defaultProps: { disableElevation: true },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
        transition: 'all 0.25s ease',
        '&:hover': { boxShadow: '0 8px 20px rgba(139,92,246,0.12), 0 2px 6px rgba(139,92,246,0.08)', transform: 'translateY(-2px)' },
      },
    },
  },
  MuiPaper: {
    styleOverrides: { root: { borderRadius: 12 } },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': { borderRadius: 10, transition: 'all 0.2s ease', '&:hover': { borderColor: '#8B5CF6' }, '&.Mui-focused': { borderColor: '#8B5CF6' } },
      },
    },
  },
  MuiChip: {
    styleOverrides: { root: { borderRadius: 6, fontWeight: 500 } },
  },
  MuiDialog: {
    styleOverrides: { paper: { borderRadius: 16 } },
  },
  MuiDrawer: {
    styleOverrides: { paper: { border: 'none' } },
  },
  MuiListItemButton: {
    styleOverrides: { root: { borderRadius: 8, transition: 'all 0.15s ease' } },
  },
  MuiListItemIcon: {
    styleOverrides: { root: { minWidth: 36 } },
  },
}

export const lightTheme = createTheme({
  ...shared,
  palette: {
    mode: 'light',
    primary: { main: '#8B5CF6', light: '#A78BFA', dark: '#7C3AED' },
    secondary: { main: '#EDE9FE', light: '#F5F3FF', dark: '#DDD6FE' },
    background: { default: '#F8FAFC', paper: '#FFFFFF' },
    text: { primary: '#111827', secondary: '#6B7280' },
    divider: '#ECECEC',
    action: { hover: 'rgba(0,0,0,0.04)', selected: 'rgba(139,92,246,0.08)' },
  },
  components: componentOverrides,
})

export const darkTheme = createTheme({
  ...shared,
  palette: {
    mode: 'dark',
    primary: { main: '#A78BFA', light: '#C4B5FD', dark: '#8B5CF6' },
    secondary: { main: '#2D1B69', light: '#3B2080', dark: '#1A0F3E' },
    background: { default: '#0F0A1E', paper: '#1A1035' },
    text: { primary: '#F1F0FF', secondary: '#A5A0C0' },
    divider: '#2D1B69',
    action: { hover: 'rgba(255,255,255,0.05)', selected: 'rgba(167,139,250,0.12)' },
  },
  components: {
    ...componentOverrides,
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          transition: 'all 0.25s ease',
          '&:hover': { boxShadow: '0 8px 20px rgba(139,92,246,0.2)', transform: 'translateY(-2px)' },
        },
      },
    },
  },
})
