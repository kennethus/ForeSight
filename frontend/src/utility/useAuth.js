import { useContext } from 'react';
import AuthContext from '../context/authProvider';  // Adjust path if needed

export const useAuth = () => {
    return useContext(AuthContext)
};

