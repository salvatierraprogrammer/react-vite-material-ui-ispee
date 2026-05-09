import { useSelector, useDispatch } from 'react-redux'
import { setUser, clearUser } from '../redux/slices/authSlice'

export function useAuth() {
  const dispatch = useDispatch()
  const { currentUser, isAuthenticated } = useSelector((s) => s.auth)

  return {
    user: currentUser,
    isAuthenticated,
    setUser: (u) => dispatch(setUser(u)),
    logout: () => dispatch(clearUser()),
  }
}
