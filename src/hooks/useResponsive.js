import { useMediaQuery, useTheme } from '@mui/material'

export function useResponsive() {
  const theme = useTheme()
  return {
    isMobile: useMediaQuery(theme.breakpoints.down('md')),
    isTablet: useMediaQuery(theme.breakpoints.between('md', 'lg')),
    isDesktop: useMediaQuery(theme.breakpoints.up('lg')),
    isSmall: useMediaQuery(theme.breakpoints.down('sm')),
  }
}
