import { Toaster } from 'react-hot-toast';
import {BrowserRouter as Router , Routes , Route} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import UserRoutes from './routes/user/UserRoutes';
import AdminRoutes from './routes/admin/AdminRoutes';
import DoctorRoutes from './routes/doctor/DoctorRoutes'






function App() {
  return (
    <Router>

      <ToastContainer/>
      <Toaster/>

      {/* Main Application Routes */}
      <Routes>
        <Route path="/user/*" element={<UserRoutes />} />
        <Route path="/doctor/*" element={<DoctorRoutes />} />
        <Route path="/admin/*" element={<AdminRoutes />} />

        <Route path="/*" element={<UserRoutes />} />

      </Routes>

    </Router>
  )
}

export default App