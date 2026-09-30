import { Routes, Route } from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import ChildrenList from './pages/ChildrenList';
import ChildDetails from './pages/ChildDetails';
import Activity from './pages/Activity';  
import { AuthProvider } from './AuthContext';
import RequireAuth from './RequireAuth';

export default function App() {
  return (
   <AuthProvider>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Register />} />
      <Route path="/" element={<RequireAuth><ChildrenList /></RequireAuth>} />
      <Route path="/children/:childId" element={<RequireAuth><ChildDetails /></RequireAuth>} />
      <Route path="/activity" element={<RequireAuth><Activity /></RequireAuth>} />
    </Routes>
    </AuthProvider>
  );
}
