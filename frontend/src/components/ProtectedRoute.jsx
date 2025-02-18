import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/authProvider';

const ProtectedRoute = () => {
    const { auth, loading } = useAuth();

    if (loading) {
        return <p>Loading...</p>;  // 🔹 Prevents redirect before auth is checked
    }

    return auth ? <Outlet /> : <Navigate to="/" />;
};

export default ProtectedRoute;
