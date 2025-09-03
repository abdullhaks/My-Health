import { Toaster } from 'react-hot-toast';
import {BrowserRouter as Router , Routes , Route} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import UserRoutes from './routes/user/UserRoutes';
import AdminRoutes from './routes/admin/AdminRoutes';
import DoctorRoutes from './routes/doctor/DoctorRoutes'
import { Suspense } from 'react';
import Loader from './sharedComponents/Loaders';






function App() {
  return (
    <Router>

      <ToastContainer/>
      <Toaster/>
      <Suspense fallback={<Loader />}>
      {/* Main Application Routes */}
      <Routes>
        <Route path="/user/*" element={<UserRoutes />} />
        <Route path="/doctor/*" element={<DoctorRoutes />} />
        <Route path="/admin/*" element={<AdminRoutes />} />

        <Route path="/*" element={<UserRoutes />} />

      </Routes>
    </Suspense>
    </Router>
  )
}

export default App