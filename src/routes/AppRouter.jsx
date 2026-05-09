import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import Loading from '../components/common/Loading'
import ProtectedRoute from '../components/auth/ProtectedRoute'

const Home = lazy(() => import('../pages/Home'))
const Materias = lazy(() => import('../pages/Materias'))
const Favoritos = lazy(() => import('../pages/Favoritos'))
const MisAportes = lazy(() => import('../pages/MisAportes'))
const Mensajes = lazy(() => import('../pages/Mensajes'))
const Foro = lazy(() => import('../pages/Foro'))
const Perfil = lazy(() => import('../pages/Perfil'))
const MaterialDetail = lazy(() => import('../pages/MaterialDetail'))
const Login = lazy(() => import('../pages/Login'))
const Register = lazy(() => import('../pages/Register'))

function Lazy({ children }) {
  return <Suspense fallback={<Loading />}>{children}</Suspense>
}

function Protected({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Lazy><Login /></Lazy>} />
        <Route path="/register" element={<Lazy><Register /></Lazy>} />
        <Route element={<MainLayout />}>
          <Route path="/" element={<Lazy><Home /></Lazy>} />
          <Route path="/materias" element={<Lazy><Materias /></Lazy>} />
          <Route path="/material/:id" element={<Lazy><MaterialDetail /></Lazy>} />
          <Route path="/favoritos" element={<Lazy><Protected><Favoritos /></Protected></Lazy>} />
          <Route path="/mis-aportes" element={<Lazy><Protected><MisAportes /></Protected></Lazy>} />
          <Route path="/mensajes" element={<Lazy><Protected><Mensajes /></Protected></Lazy>} />
          <Route path="/foro" element={<Lazy><Foro /></Lazy>} />
          <Route path="/perfil" element={<Lazy><Protected><Perfil /></Protected></Lazy>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
