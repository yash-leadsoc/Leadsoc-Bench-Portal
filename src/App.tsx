import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './store/auth'
import { Layout } from './components/Layout'
import { Loader } from './components/ui'
import Login from './pages/Login'
import ChangePassword from './pages/ChangePassword'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import Materials from './pages/Materials'
import Plans from './pages/Plans'
import Assessments from './pages/Assessments'
import Progress from './pages/Progress'
import Prep from './pages/Prep'
import Interviews from './pages/Interviews'
import Readiness from './pages/Readiness'
import People from './pages/People'
import Reports from './pages/Reports'
import Admin from './pages/Admin'
import Library from './pages/Library'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'
import EmployeeHome from './pages/employee/EmployeeHome'
import MyTraining from './pages/employee/MyTraining'
import MyAssessments from './pages/employee/MyAssessments'
import MyPrep from './pages/employee/MyPrep'
import MyInterviews from './pages/employee/MyInterviews'
import MyAvailability from './pages/employee/MyAvailability'
import MyProfile from './pages/employee/MyProfile'
import Training from './pages/Training'
import MyTrainingPlan from './pages/employee/MyTrainingPlan'
import CtoDashboard from './pages/CtoDashboard'
import Requirements from './pages/Requirements'


export default function App() {
  const { user, loading } = useAuth()
  if (loading) return <Loader />
  if (!user) return <Login />
  if (user.mustChangePassword) return <ChangePassword forced />
  const emp = user.role === 'benchEngineer'
  const cto = user.role === 'cto'
  return (
    <Layout>
      <Routes>
        {emp ? (
          <>
            <Route path="/me" element={<EmployeeHome />} />
            <Route path="/my-training" element={<MyTraining />} />
            <Route path="/my-training/:planId" element={<MyTrainingPlan />} />
            <Route path="/my-assessments" element={<MyAssessments />} />
            <Route path="/my-prep" element={<MyPrep />} />
            <Route path="/my-interviews" element={<MyInterviews />} />
            <Route path="/my-availability" element={<MyAvailability />} />
            <Route path="/my-profile" element={<MyProfile />} />
            <Route path="/library" element={<Library />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="*" element={<Navigate to="/me" />} />
          </>
        ) : cto ? (
          <>
            <Route path="/dashboard" element={<CtoDashboard />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/training" element={<Training />} />
            <Route path="/requirements" element={<Requirements />} />
            <Route path="/people" element={<People />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/library" element={<Library />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </>
        ) : (
          <>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/employees" element={<Employees />} />
            {/* <Route path="/materials" element={<Materials />} />
            <Route path="/plans" element={<Plans />} /> */}
            <Route path="/training" element={<Training />} />
            <Route path="/materials" element={<Navigate to="/training" />} />
            <Route path="/plans" element={<Navigate to="/training" />} />
            {/* <Route path="/assessments" element={<Assessments />} /> */}
            <Route path="/assessments" element={<Navigate to="/training" />} />
            {/* <Route path="/progress" element={<Progress />} /> */}
            <Route path="/progress" element={<Navigate to="/training" />} />
            <Route path="/prep" element={<Prep />} />
            <Route path="/interviews" element={<Interviews />} />
            <Route path="/readiness" element={<Readiness />} />
            <Route path="/people" element={<People />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/library" element={<Library />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </>
        )}
      </Routes>
    </Layout>
  )
}
