import PropTypes from 'prop-types';
import { createContext, useEffect, useState, useMemo } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`, { withCredentials: true })
            .then(res => {
                if (res.data.success) {
                    console.log("✅ Authenticated User:", res.data.user);
                    setAuth(res.data.user);
                }
            })
            .catch(() => {
                console.log("❌ Not authenticated");
                setAuth(null);
            })
            .finally(() => setLoading(false));
    }, []);

    const contextValue = useMemo(() => ({ auth, setAuth, loading }), [auth, loading]);

    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export default AuthContext;
