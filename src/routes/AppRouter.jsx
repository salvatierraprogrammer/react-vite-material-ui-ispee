import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import AdminLayout from '../components/layout/AdminLayout'
import AdminRoute from '../components/auth/AdminRoute'
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
const ResetPassword = lazy(() => import('../pages/ResetPassword'))

const Configuracion = lazy(() => import('../pages/Configuracion'))
const Seguridad = lazy(() => import('../pages/Seguridad'))
const Notificaciones = lazy(() => import('../pages/Notificaciones'))
const Ayuda = lazy(() => import('../pages/Ayuda'))

// Admin pages
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'))
const AdminUsers = lazy(() => import('../pages/admin/AdminUsers'))
const AdminReports = lazy(() => import('../pages/admin/AdminReports'))
const AdminSanctions = lazy(() => import('../pages/admin/AdminSanctions'))
const AdminForum = lazy(() => import('../pages/admin/AdminForum'))
const AdminMaterials = lazy(() => import('../pages/admin/AdminMaterials'))
const AdminStorage = lazy(() => import('../pages/admin/AdminStorage'))
const AdminAuditLogs = lazy(() => import('../pages/admin/AdminAuditLogs'))
const AdminCleanup = lazy(() => import('../pages/admin/AdminCleanup'))
const AdminAlerts = lazy(() => import('../pages/admin/AdminAlerts'))
const AdminSecurity = lazy(() => import('../pages/admin/AdminSecurity'))

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
        <Route path="/reset-password" element={<Lazy><ResetPassword /></Lazy>} />
        <Route element={<MainLayout />}>
          <Route path="/" element={<Lazy><Home /></Lazy>} />
          <Route path="/materias" element={<Lazy><Materias /></Lazy>} />
          <Route path="/material/:id" element={<Lazy><MaterialDetail /></Lazy>} />
          <Route path="/favoritos" element={<Lazy><Protected><Favoritos /></Protected></Lazy>} />
          <Route path="/mis-aportes" element={<Lazy><Protected><MisAportes /></Protected></Lazy>} />
          <Route path="/mensajes" element={<Lazy><Protected><Mensajes /></Protected></Lazy>} />
          <Route path="/foro" element={<Lazy><Foro /></Lazy>} />
          <Route path="/perfil" element={<Lazy><Protected><Perfil /></Protected></Lazy>} />
          <Route path="/configuracion" element={<Lazy><Protected><Configuracion /></Protected></Lazy>} />
          <Route path="/seguridad" element={<Lazy><Protected><Seguridad /></Protected></Lazy>} />
          <Route path="/notificaciones" element={<Lazy><Protected><Notificaciones /></Protected></Lazy>} />
          <Route path="/ayuda" element={<Lazy><Ayuda /></Lazy>} />
        </Route>

        {/* Admin routes */}
        <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route path="/admin" element={<Lazy><AdminDashboard /></Lazy>} />
          <Route path="/admin/usuarios" element={<Lazy><AdminUsers /></Lazy>} />
          <Route path="/admin/reportes" element={<Lazy><AdminReports /></Lazy>} />
          <Route path="/admin/sanciones" element={<Lazy><AdminSanctions /></Lazy>} />
          <Route path="/admin/foro" element={<Lazy><AdminForum /></Lazy>} />
          <Route path="/admin/materiales" element={<Lazy><AdminMaterials /></Lazy>} />
          <Route path="/admin/almacenamiento" element={<Lazy><AdminStorage /></Lazy>} />
          <Route path="/admin/auditoria" element={<Lazy><AdminAuditLogs /></Lazy>} />
          <Route path="/admin/limpieza" element={<Lazy><AdminCleanup /></Lazy>} />
          <Route path="/admin/alertas" element={<Lazy><AdminAlerts /></Lazy>} />
          <Route path="/admin/seguridad" element={<Lazy><AdminSecurity /></Lazy>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
