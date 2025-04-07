import { Toaster } from 'react-hot-toast';
import {BrowserRouter as Router , Routes , Route} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import UserRoutes from './routes/UserRoutes';


function App() {
  return (
    <Router>

      <ToastContainer/>
      <Toaster/>

      {/* Main Application Routes */}
      <Routes>
        <Route path="/user/*" element={<UserRoutes />} />
        <Route path="/doctor/*" element={<UserRoutes />} />

        <Route path="/*" element={<UserRoutes />} />

      </Routes>

    </Router>
  )
}

export default App