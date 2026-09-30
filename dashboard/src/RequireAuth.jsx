import { Navigate } from 'react-router-dom';
import { useAuth } from './useAuth';

export default function RequireAuth({ children }) {
  const { user, checking } = useAuth();

  if (checking) return <p className="p-6">Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}