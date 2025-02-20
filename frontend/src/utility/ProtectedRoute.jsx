import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './useAuth';

const ProtectedRoute = () => {
    const { auth, loading } = useAuth();

    if (loading) {
        return <p>Loading...</p>;  // 🔹 Prevents redirect before auth is checked
    }

    console.log("Protected route:", auth)
    return auth ? <Outlet /> : <Navigate to="/" />;
};

export default ProtectedRoute;
