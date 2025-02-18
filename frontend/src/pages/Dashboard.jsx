import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/authProvider";

const Dashboard = () => {
    const { auth, setAuth } = useContext(AuthContext); // Get setAuth from context
    const navigate = useNavigate();

    useEffect(() => {
        if (!auth) {
            navigate("/");
        }
    }, [auth, navigate]);

    // Logout function using axios
    const logoutHandler = async () => {
        try {
            const response = await axios.post("http://localhost:3000/api/auth/logout", {}, { withCredentials: true });

            if (response.data.success) {
                setAuth(null); // Clear auth context
                navigate("/"); // Redirect to login page
            } else {
                console.error("Logout failed:", response.data.message);
            }
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    return (
        <div>
            <h1>Welcome to the Dashboard</h1>
            {auth?.name ? (
                <>
                    <p>Logged in as: {auth.name}</p>
                    <button onClick={logoutHandler}>Logout</button>
                </>
            ) : (
                <p>You are not logged in.</p>
            )}
        </div>
    );
};

export default Dashboard;
