import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuthContext } from './context/AuthContext'
import { LangProvider } from './context/LangContext'
import { NotificationProvider } from './context/NotificationContext'
import Layout from './components/layout/Layout'
import StudentLayout from './components/layout/StudentLayout'
import TeacherLayout from './components/layout/TeacherLayout'
import Dashboard from './pages/Dashboard'
import Students from './pages/Students'
import Groups from './pages/Groups'
import Payments from './pages/Payments'
import Attendance from './pages/Attendance'
import Requests from './pages/Requests'
import Directions from './pages/Directions'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Register from './pages/Register'
import AuthCallback from './pages/AuthCallback'
import Users from './pages/Users'
import Teachers from './pages/Teachers'
import Welcome from './pages/Welcome'
// Student panel
import StudentDashboard from './pages/student/StudentDashboard'
import StudentGroups from './pages/student/StudentGroups'
import StudentAttendance from './pages/student/StudentAttendance'
import StudentProfile from './pages/student/StudentProfile'
// Teacher panel
import TeacherDashboard from './pages/teacher/TeacherDashboard'
import TeacherGroups from './pages/teacher/TeacherGroups'
import TeacherAttendance from './pages/teacher/TeacherAttendance'
import TeacherProfile from './pages/teacher/TeacherProfile'
import TeacherMaterials from './pages/teacher/TeacherMaterials'
import TeacherSchedule from './pages/teacher/TeacherSchedule'
import TeacherAssignments from './pages/teacher/TeacherAssignments'
import TeacherGrades from './pages/teacher/TeacherGrades'
// Student panel
import StudentMaterials from './pages/student/StudentMaterials'
import StudentSchedule from './pages/student/StudentSchedule'
import StudentAssignments from './pages/student/StudentAssignments'
import StudentGrades from './pages/student/StudentGrades'

function ProtectedRoute() {
  const { user, isLoading } = useAuthContext()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-light dark:bg-bg-dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  // Role-based redirect
  if (user.role === 'student') return <Navigate to="/student/dashboard" replace />
  if (user.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />
  if (user.role === 'user') return <Navigate to="/welcome" replace />

  return <Outlet />
}

const SPINNER = (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
)

function RoleGuard({ allowed, redirectTo }: { allowed: string[]; redirectTo: string }) {
  const { user, isLoading } = useAuthContext()
  if (isLoading) return SPINNER
  if (!user) return <Navigate to="/login" replace />
  if (!allowed.includes(user.role)) return <Navigate to={redirectTo} replace />
  return <Outlet />
}

function UserRoute() {
  const { user, isLoading } = useAuthContext()
  if (isLoading) return SPINNER
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'student') return <Navigate to="/student/dashboard" replace />
  if (user.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />
  if (user.role !== 'user') return <Navigate to="/dashboard" replace />
  return <Outlet />
}

export default function App() {
  return (
    <LangProvider>
      <AuthProvider>
        <NotificationProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Admin panel */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="students" element={<Students />} />
                <Route path="directions" element={<Directions />} />
                <Route path="groups" element={<Groups />} />
                <Route path="payments" element={<Payments />} />
                <Route path="attendance" element={<Attendance />} />
                <Route path="requests" element={<Requests />} />
                <Route path="profile" element={<Profile />} />
                <Route path="users" element={<Users />} />
                <Route path="teachers" element={<Teachers />} />
              </Route>
            </Route>

            {/* User (unassigned) welcome page */}
            <Route element={<UserRoute />}>
              <Route path="/welcome" element={<Welcome />} />
            </Route>

            {/* Student panel */}
            <Route element={<RoleGuard allowed={['student', 'admin', 'superadmin']} redirectTo="/dashboard" />}>
              <Route path="/student" element={<StudentLayout />}>
                <Route index element={<Navigate to="/student/dashboard" replace />} />
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="groups" element={<StudentGroups />} />
                <Route path="attendance" element={<StudentAttendance />} />
                <Route path="materials" element={<StudentMaterials />} />
                <Route path="schedule" element={<StudentSchedule />} />
                <Route path="assignments" element={<StudentAssignments />} />
                <Route path="grades" element={<StudentGrades />} />
                <Route path="profile" element={<StudentProfile />} />
              </Route>
            </Route>

            {/* Teacher panel */}
            <Route element={<RoleGuard allowed={['teacher', 'admin', 'superadmin']} redirectTo="/dashboard" />}>
              <Route path="/teacher" element={<TeacherLayout />}>
                <Route index element={<Navigate to="/teacher/dashboard" replace />} />
                <Route path="dashboard" element={<TeacherDashboard />} />
                <Route path="groups" element={<TeacherGroups />} />
                <Route path="attendance" element={<TeacherAttendance />} />
                <Route path="materials" element={<TeacherMaterials />} />
                <Route path="schedule" element={<TeacherSchedule />} />
                <Route path="assignments" element={<TeacherAssignments />} />
                <Route path="grades" element={<TeacherGrades />} />
                <Route path="profile" element={<TeacherProfile />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </LangProvider>
  )
}
