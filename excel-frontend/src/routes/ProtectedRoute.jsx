import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  const location = useLocation();

  if (!token) {
    // Yaad rakho kahan jana tha — login ke baad wahin wapas 🎯
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return children;
};
export default ProtectedRoute;
