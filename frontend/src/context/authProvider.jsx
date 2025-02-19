import PropTypes from 'prop-types';  // ✅ Import PropTypes
import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(null);  // 🔹 Default is null (not authenticated)
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`, { withCredentials: true })
            .then(res => {
                if (res.data.success) {
                    console.log("✅ Authenticated User:", res.data.user);
                    setAuth(res.data.user);  // 🔹 Set authenticated user
                }
            })
            .catch(() => {
                console.log("❌ Not authenticated");
                setAuth(null);
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <AuthContext.Provider value={{ auth, setAuth, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);


AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthContext;